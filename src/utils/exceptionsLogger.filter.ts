import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

@Catch()
export class ExceptionsLoggerFilter extends BaseExceptionFilter{
    catch(exception: unknown, host: ArgumentsHost): void {
        console.log('Esxceptoin throw', exception);
        super.catch(exception, host);
    }
}