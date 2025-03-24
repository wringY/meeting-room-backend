import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLoginTypeColumn1742782626828 implements MigrationInterface {
    name = 'AddUserLoginTypeColumn1742782626828'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`loginType\` enum ('0', '1', '2') NOT NULL COMMENT '登录类型' DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`loginType\``);
    }

}
