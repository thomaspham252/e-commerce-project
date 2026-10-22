package com.fit.project.enums;

import java.util.EnumSet;
import java.util.Set;

public enum ApplicationStatus {
    PENDING, VIEWED, INVITED, REJECTED, HIRED;

    /** Luồng chuyển trạng thái hợp lệ. REJECTED và HIRED là trạng thái kết thúc. */
    public Set<ApplicationStatus> nextAllowed() {
        return switch (this) {
            case PENDING -> EnumSet.of(VIEWED, INVITED, REJECTED, HIRED);
            case VIEWED -> EnumSet.of(INVITED, REJECTED, HIRED);
            case INVITED -> EnumSet.of(REJECTED, HIRED);
            case REJECTED, HIRED -> EnumSet.noneOf(ApplicationStatus.class);
        };
    }

    public boolean canMoveTo(ApplicationStatus target) {
        return nextAllowed().contains(target);
    }
}
