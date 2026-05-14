export const databaseConfigElement = (): string => `import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

type DatabaseType = "sqlite" | "postgres" | "mysql" | "mariadb";

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
	constructor(private readonly configService: ConfigService) {}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		const type = this.configService.get<DatabaseType>("DB_TYPE") ?? "sqlite";
		const baseOptions = {
			entities: [__dirname + "/../../**/*.orm.entity.{js,ts}"],
			synchronize: this.configService.get<string>("DB_SYNCHRONIZE") === "true",
		};

		if (type === "sqlite") {
			return {
				...baseOptions,
				type: "sqlite",
				database: this.configService.get<string>("DB_DATABASE") ?? "database.sqlite",
			};
		}

		return {
			...baseOptions,
			type,
			host: this.configService.get<string>("DB_HOST") ?? "localhost",
			port: this.configService.get<number>("DB_PORT") ?? 5432,
			username: this.configService.get<string>("DB_USERNAME") ?? "root",
			password: this.configService.get<string>("DB_PASSWORD") ?? "",
			database: this.configService.get<string>("DB_DATABASE") ?? "app",
		};
	}
}
`;
