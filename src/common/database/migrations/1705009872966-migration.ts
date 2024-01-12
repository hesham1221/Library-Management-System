import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1705009872966 implements MigrationInterface {
    name = 'Migration1705009872966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" ADD "bookCover" character varying`);
        await queryRunner.query(`ALTER TABLE "book" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "book" ADD "numberOfBorrowed" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "book" ADD "totalQuantity" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "numberOfBorrowedBooks" integer`);
        await queryRunner.query(`ALTER TABLE "book_borrow_details" ALTER COLUMN "actualReturnDate" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_borrow_details" ALTER COLUMN "actualReturnDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "numberOfBorrowedBooks"`);
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "totalQuantity"`);
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "numberOfBorrowed"`);
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "bookCover"`);
    }

}
