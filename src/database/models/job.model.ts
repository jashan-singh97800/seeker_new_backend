import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, Index } from 'sequelize-typescript';
import { Company } from './company.model';
import { User } from './user.model';
import { Application } from './application.model';
import { SavedJob } from './saved-job.model';

@Table({ tableName: 'jobs', timestamps: true, paranoid: true })
export class Job extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => Company)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare company_id: string;

    @BelongsTo(() => Company)
    declare company: Company;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare posted_by: string;

    @BelongsTo(() => User)
    declare poster: User;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare description: string;

    @Column(DataType.TEXT)
    declare requirements: string;

    @Index
    @Column(DataType.STRING(255))
    declare location: string;

    @Index
    @Column(DataType.ENUM('full_time', 'part_time', 'contract', 'internship', 'freelance'))
    declare job_type: string;

    @Column(DataType.DECIMAL(3, 1))
    declare experience_min: number;

    @Column(DataType.DECIMAL(3, 1))
    declare experience_max: number;

    @Column(DataType.DECIMAL(12, 2))
    declare salary_min: number;

    @Column(DataType.DECIMAL(12, 2))
    declare salary_max: number;

    @Column({
        type: DataType.STRING(3),
        defaultValue: 'INR',
    })
    declare salary_currency: string;

    @Column(DataType.JSON)
    declare skills_required: any;

    @Column(DataType.STRING(255))
    declare education_required: string;

    @Index
    @Column({
        type: DataType.ENUM('draft', 'active', 'paused', 'closed', 'expired'),
        defaultValue: 'draft',
    })
    declare status: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    declare is_featured: boolean;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    declare views_count: number;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    declare applications_count: number;

    @Column(DataType.DATE)
    declare expires_at: Date;

    @HasMany(() => Application, 'job_id')
    declare applications: Application[];

    @HasMany(() => SavedJob, 'job_id')
    declare savedBy: SavedJob[];
}
