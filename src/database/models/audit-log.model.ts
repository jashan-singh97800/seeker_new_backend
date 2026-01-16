import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import { User } from './user.model';
import { Job } from './job.model';

@Table({ tableName: 'audit_logs', timestamps: true, updatedAt: false })
export class AuditLog extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    declare user_id: string;

    @BelongsTo(() => User)
    declare user: User;

    @ForeignKey(() => Job)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    declare job_id: string;

    @BelongsTo(() => Job)
    declare job: Job;

    @Index
    @Column(DataType.STRING(50))
    declare entity_type: string;

    @Column(DataType.UUID)
    declare entity_id: string;

    @Column(DataType.STRING(50))
    declare action: string;

    @Column(DataType.JSON)
    declare changes: any;

    @Column(DataType.STRING(45))
    declare ip_address: string;

    @Column(DataType.TEXT)
    declare user_agent: string;
}
