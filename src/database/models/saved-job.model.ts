import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Job } from './job.model';

@Table({ tableName: 'saved_jobs', timestamps: true, updatedAt: false })
export class SavedJob extends Model {
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
}
