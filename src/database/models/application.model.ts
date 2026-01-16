import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import { User } from './user.model';
import { Job } from './job.model';

@Table({ tableName: 'applications', timestamps: true })
export class Application extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare user_id: string;

    @BelongsTo(() => User)
    declare user: User;

    @ForeignKey(() => Job)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare job_id: string;

    @BelongsTo(() => Job)
    declare job: Job;

    @Index
    @Column({
        type: DataType.ENUM('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'rejected', 'accepted', 'withdrawn'),
        defaultValue: 'submitted',
    })
    declare status: string;

    @Column(DataType.STRING(500))
    declare resume_url: string;

    @Column(DataType.TEXT)
    declare cover_letter: string;

    @Column(DataType.JSON)
    declare answers: any;

    @Column(DataType.TEXT)
    declare recruiter_notes: string;

    @Column({
        type: DataType.DATE,
        field: 'applied_at',
        defaultValue: DataType.NOW,
    })
    declare applied_at: Date;
}
