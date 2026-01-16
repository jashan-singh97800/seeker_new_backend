import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'job_alerts', timestamps: true })
export class JobAlert extends Model {
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

    @Column(DataType.STRING(255))
    declare alert_name: string;

    @Column({
        type: DataType.JSON,
        allowNull: false,
    })
    declare search_criteria: any;

    @Column({
        type: DataType.ENUM('immediate', 'daily', 'weekly'),
        defaultValue: 'daily',
    })
    declare frequency: string;

    @Index
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    declare is_active: boolean;

    @Column(DataType.DATE)
    declare last_sent_at: Date;
}
