export const databaseConfigElement = () => `import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) {}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		return {
			//type: "database",
			host: this.configService.get<string>("DB_ENV"),
			port: this.configService.get<number>("DB_ENV"),
			username: this.configService.get<string>("DB_ENV"),
			password: this.configService.get<string>("DB_ENV"),
			database: this.configService.get<string>("DB_ENV"),
			entities: [__dirname + "/../../**/*.entity.{js,ts}"],
			synchronize: false,
		};
	}
}
`;
