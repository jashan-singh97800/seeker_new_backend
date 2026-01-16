import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ tableName: 'user_profiles', timestamps: false })
export class UserProfile extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        unique: true,
        allowNull: false,
    })
    declare user_id: string;

    @BelongsTo(() => User)
    declare user: User;

    @Column(DataType.STRING(255))
    declare full_name: string;

    @Column(DataType.STRING(20))
    declare phone: string;

    @Index
    @Column(DataType.STRING(255))
    declare location: string;

    @Column(DataType.STRING(255))
    declare current_position: string;

    @Index
    @Column(DataType.DECIMAL(3, 1))
    declare experience_years: number;

    @Column(DataType.DECIMAL(12, 2))
    declare current_salary: number;

    @Column(DataType.DECIMAL(12, 2))
    declare expected_salary: number;

    @Column(DataType.STRING(500))
    declare resume_url: string;

    @Column(DataType.STRING(255))
    declare resume_key: string;

    @Column(DataType.STRING(500))
    declare profile_picture_url: string;

    @Column(DataType.TEXT)
    declare bio: string;

    @Column(DataType.STRING(500))
    declare linkedin_url: string;

    @Column(DataType.STRING(500))
    declare portfolio_url: string;

    @Column(DataType.JSON)
    declare skills: any;

    @Column(DataType.JSON)
    declare languages: any;

    @Column(DataType.JSON)
    declare preferences: any;
}
