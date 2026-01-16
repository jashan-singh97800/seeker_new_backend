import { Table, Column, Model, DataType, HasMany, Index } from 'sequelize-typescript';
import { Job } from './job.model';

@Table({ tableName: 'companies', timestamps: true })
export class Company extends Model {
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
    declare name: string;

    @Column(DataType.TEXT)
    declare description: string;

    @Column(DataType.STRING(255))
    declare website: string;

    @Index
    @Column(DataType.STRING(100))
    declare industry: string;

    @Column(DataType.ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'))
    declare company_size: string;

    @Column(DataType.STRING(500))
    declare logo_url: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    declare verified: boolean;

    @HasMany(() => Job, 'company_id')
    declare jobs: Job[];
}
