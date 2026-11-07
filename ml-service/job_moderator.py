import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger("JobModerator")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODERATION_MODEL_DIR = os.path.join(CURRENT_DIR, "phobert_job_moderation")
CONFIG_PATH = os.path.join(MODERATION_MODEL_DIR, "inference_config.json")


class JobModerationEngine:
    def __init__(self, model_dir: str = MODERATION_MODEL_DIR):
        self.model_dir = model_dir
        self.tokenizer = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.is_ready = False
        self.inference_config = {}
        self.hard_rules = {}
        self.soft_rules = {}
        self.t_safe = 0.8
        self.t_high = 0.5
        self.has_pyvi = False

        try:
            from pyvi import ViTokenizer
            self.has_pyvi = True
        except ImportError:
            self.has_pyvi = False

        self._load_config()

    def _load_config(self):
        if os.path.isfile(CONFIG_PATH):
            try:
                with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                    self.inference_config = json.load(f)
                    self.hard_rules = self.inference_config.get("hard_rules", {})
                    self.soft_rules = self.inference_config.get("soft_rules", {})
                    self.t_safe = float(self.inference_config.get("t_safe", 0.8))
                    self.t_high = float(self.inference_config.get("t_high", 0.5))
                    logger.info("Loaded inference_config.json: %d hard rules, %d soft rules.",
                                len(self.hard_rules), len(self.soft_rules))
            except Exception as e:
                logger.warning("Could not read inference_config.json: %s. Using default heuristics.", e)

    def load_model(self) -> bool:
        if not os.path.isdir(self.model_dir):
            logger.warning("PhoBERT job moderation model directory not found at: %s", self.model_dir)
            return False

        try:
            logger.info("Loading PhoBERT Job Moderation Model from: %s on device: %s ...", self.model_dir, self.device)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_dir)
            self.model = AutoModelForSequenceClassification.from_pretrained(self.model_dir)
            self.model.to(self.device)
            self.model.eval()
            self.is_ready = True
            logger.info("PhoBERT Job Moderation Model ready! Labels: %s", self.model.config.id2label)
            return True
        except Exception as e:
            logger.error("Failed to load PhoBERT Job Moderation Model: %s", str(e), exc_info=True)
            self.is_ready = False
            return False

    def segment_vietnamese(self, text: str) -> str:
        if self.has_pyvi:
            try:
                from pyvi import ViTokenizer
                return ViTokenizer.tokenize(text)
            except Exception:
                return text
        return text

    def check_rules(self, text: str) -> Dict[str, Any]:
        """Scans text against predefined hard_rules and soft_rules."""
        hard_matched = []
        soft_matched = []

        if not text:
            return {"hard_matched": [], "soft_matched": []}

        for rule_name, pattern in self.hard_rules.items():
            try:
                if re.search(pattern, text, re.IGNORECASE):
                    hard_matched.append(rule_name)
            except re.error as e:
                logger.warning("Regex error for rule '%s': %s", rule_name, e)

        for rule_name, pattern in self.soft_rules.items():
            try:
                if re.search(pattern, text, re.IGNORECASE):
                    soft_matched.append(rule_name)
            except re.error as e:
                logger.warning("Regex error for soft rule '%s': %s", rule_name, e)

        return {
            "hard_matched": hard_matched,
            "soft_matched": soft_matched
        }

    def predict(
        self,
        title: str,
        description: Optional[str] = "",
        requirements: Optional[str] = "",
        level: Optional[str] = "",
        salary_min: Optional[float] = None,
        salary_max: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Combines Rule-Based Heuristics + Deep PhoBERT Inference to categorize:
        - 'an_toan': Clean & legitimate job posting
        - 'nghi_van': Suspicious job posting requiring manual admin attention
        - 'nguy_co_cao': Highly fraudulent or policy-violating job posting
        """
        title = title or ""
        desc = description or ""
        req = requirements or ""
        lvl = level or ""

        # Format salary representation
        salary_text = ""
        if salary_min or salary_max:
            if salary_min and salary_max:
                salary_text = f"từ {int(salary_min):,} đến {int(salary_max):,} VNĐ"
            elif salary_min:
                salary_text = f"từ {int(salary_min):,} VNĐ"
            else:
                salary_text = f"đến {int(salary_max):,} VNĐ"

        # Construct raw combined text for rule matching
        raw_full_text = f"{title}\n{desc}\n{req}"

        # 1. Check Regex Rules
        rule_results = self.check_rules(raw_full_text)
        hard_matched = rule_results["hard_matched"]
        soft_matched = rule_results["soft_matched"]

        # Check salary anomaly: e.g. Intern/Fresher with salary > 35m
        reasons: List[str] = []
        for r in hard_matched:
            reasons.append(f"Quy định nghiêm cấm: {r}")
        for r in soft_matched:
            reasons.append(f"Dấu hiệu nghi vấn: {r}")

        lvl_lower = lvl.lower()
        if any(w in lvl_lower for w in ["intern", "thực tập", "fresher", "không yêu cầu"]):
            if salary_min and salary_min >= 25000000:
                anomaly_msg = f"Mức lương bất thường ({salary_text}) so với cấp bậc '{lvl}'"
                soft_matched.append(anomaly_msg)
                reasons.append(f"Cảnh báo: {anomaly_msg}")

        # 2. PhoBERT Sequence Classification Inference
        phobert_label = "an_toan"
        phobert_probs = {"an_toan": 0.9, "nghi_van": 0.08, "nguy_co_cao": 0.02}
        confidence = 0.9

        if self.is_ready and self.model is not None and self.tokenizer is not None:
            # Format text for model: Vị trí: ... Cấp bậc: ... Lương: ... Mô tả: ... Yêu cầu: ...
            model_text = f"Vị trí: {title}. Cấp bậc: {lvl}. Mức lương: {salary_text}. Mô tả: {desc}. Yêu cầu: {req}"
            segmented_text = self.segment_vietnamese(model_text)

            try:
                inputs = self.tokenizer(
                    segmented_text.strip(),
                    return_tensors="pt",
                    truncation=True,
                    max_length=256,
                    padding=True
                ).to(self.device)

                with torch.no_grad():
                    outputs = self.model(**inputs)
                    probs = torch.softmax(outputs.logits, dim=-1).squeeze().tolist()

                if isinstance(probs, float):
                    probs = [probs]

                id2label = self.model.config.id2label
                phobert_probs = {}
                for idx, p in enumerate(probs):
                    lbl = str(id2label.get(idx, id2label.get(str(idx), f"class_{idx}")))
                    phobert_probs[lbl] = round(float(p), 4)

                best_idx = int(np.argmax(probs))
                phobert_label = str(id2label.get(best_idx, id2label.get(str(best_idx), "an_toan")))
                confidence = float(probs[best_idx])
            except Exception as e:
                logger.error("PhoBERT inference error: %s", e)

        # 3. Hybrid Decision Logic
        final_label = phobert_label
        p_safe = phobert_probs.get("an_toan", 0.0)
        p_suspicious = phobert_probs.get("nghi_van", 0.0)
        p_high = phobert_probs.get("nguy_co_cao", 0.0)

        # Rule overrides:
        if len(hard_matched) > 0:
            final_label = "nguy_co_cao"
            confidence = max(confidence, 0.95)
        elif len(soft_matched) >= 2 or p_high >= self.t_high:
            final_label = "nguy_co_cao"
            confidence = max(confidence, p_high, 0.85)
        elif len(soft_matched) == 1 or p_suspicious >= 0.35:
            if final_label == "an_toan":
                final_label = "nghi_van"
                confidence = max(confidence, 0.75)
        elif p_safe >= self.t_safe and len(hard_matched) == 0 and len(soft_matched) == 0:
            final_label = "an_toan"

        # Format reasons string
        reasons_text = "; ".join(reasons) if reasons else "Nội dung chuẩn mực, không phát hiện dấu hiệu vi phạm"

        return {
            "label": final_label,
            "score": round(confidence, 4),
            "reasons": reasons_text,
            "probabilities": phobert_probs,
            "hard_rules_matched": hard_matched,
            "soft_rules_matched": soft_matched
        }


# Singleton instance
moderator = JobModerationEngine()

