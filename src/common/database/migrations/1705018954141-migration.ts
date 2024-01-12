import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1705018954141 implements MigrationInterface {
    name = 'Migration1705018954141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" ADD "borrowTime" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "borrowTime"`);
    }

}
