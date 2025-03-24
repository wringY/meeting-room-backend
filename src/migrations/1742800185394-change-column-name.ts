import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnName1742800185394 implements MigrationInterface {
    name = 'ChangeColumnName1742800185394'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`loginType\` \`login_type\` enum ('0', '1', '2') NOT NULL COMMENT '登录类型' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` DROP COLUMN \`createTime\``);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` DROP COLUMN \`isBooked\``);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` DROP COLUMN \`updateTime\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP COLUMN \`createTime\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP COLUMN \`endTime\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP COLUMN \`startTime\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP COLUMN \`updateTime\``);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` ADD \`is_booked\` tinyint NOT NULL COMMENT '是否被预约' DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` ADD \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` ADD \`update_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD \`start_time\` datetime NOT NULL COMMENT '开始时间'`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD \`end_time\` datetime NOT NULL COMMENT '结束时间'`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD \`create_time\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD \`update_time\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`booking\` DROP COLUMN \`update_time\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP COLUMN \`create_time\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP COLUMN \`end_time\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP COLUMN \`start_time\``);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` DROP COLUMN \`update_time\``);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` DROP COLUMN \`create_time\``);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` DROP COLUMN \`is_booked\``);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD \`updateTime\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD \`startTime\` datetime NOT NULL COMMENT '开始时间'`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD \`endTime\` datetime NOT NULL COMMENT '结束时间'`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD \`createTime\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` ADD \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` ADD \`isBooked\` tinyint NOT NULL COMMENT '是否被预约' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`meeting_room\` ADD \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`login_type\` \`loginType\` enum ('0', '1', '2') NOT NULL COMMENT '登录类型' DEFAULT '0'`);
    }

}
