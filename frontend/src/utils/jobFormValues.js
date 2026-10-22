/** Chuyển đổi giữa dữ liệu tin tuyển dụng của backend và giá trị của JobForm. */

export const JOB_FORM_DEFAULTS = {
  title: '',
  level: 'Junior',
  vacancies: 1,
  location: '',
  jobType: 'Toàn thời gian',
  salaryMin: '',
  salaryMax: '',
  workingSchedule: '',
  description: '',
  requirements: '',
  deadline: '',
};

/** Lương nhập theo đơn vị triệu, backend lưu VND. */
const MILLION = 1_000_000;

/** Dữ liệu tin từ backend → giá trị form. */
export const jobToFormValues = (job) => ({
  ...JOB_FORM_DEFAULTS,
  ...Object.fromEntries(Object.entries(job).filter(([k, v]) => k in JOB_FORM_DEFAULTS && v !== null)),
  salaryMin: job.salaryMin ? Number(job.salaryMin) / MILLION : '',
  salaryMax: job.salaryMax ? Number(job.salaryMax) / MILLION : '',
});

/** Giá trị form → body JobRequest của backend. */
export const formValuesToJob = (data) => ({
  ...data,
  vacancies: Number(data.vacancies) || 1,
  salaryMin: data.salaryMin === '' ? null : Math.round(Number(data.salaryMin) * MILLION),
  salaryMax: data.salaryMax === '' ? null : Math.round(Number(data.salaryMax) * MILLION),
  salaryUnit: 'MONTH',
});
