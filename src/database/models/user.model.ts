import { Table, Column, Model, DataType, HasOne, HasMany, Index } from 'sequelize-typescript';
import { UserProfile } from './user-profile.model';
import { Job } from './job.model';
import { Application } from './application.model';
import { SavedJob } from './saved-job.model';
import { JobAlert } from './job-alert.model';
import { AuditLog } from './audit-log.model';

@Table({ tableName: 'users', timestamps: true, paranoid: true })
export class User extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @Index
    @Column({
        type: DataType.STRING(255),
        unique: true,
        allowNull: false,
    })
    declare email: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    declare password_hash: string;

    @Index
    @Column({
        type: DataType.ENUM('job_seeker', 'employer', 'admin'),
        allowNull: false,
    })
    declare role: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    declare email_verified: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    declare is_active: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare last_login_at: Date;

    @HasOne(() => UserProfile, 'user_id')
    declare profile: UserProfile;

    @HasMany(() => Job, 'posted_by')
    declare postedJobs: Job[];

    @HasMany(() => Application, 'user_id')
    declare applications: Application[];

    @HasMany(() => SavedJob, 'user_id')
    declare savedJobs: SavedJob[];

    @HasMany(() => JobAlert, 'user_id')
    declare alerts: JobAlert[];

    @HasMany(() => AuditLog, 'user_id')
    declare auditLogs: AuditLog[];
}
