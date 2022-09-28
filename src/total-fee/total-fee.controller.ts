import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TotalFeeService } from './total-fee.service';
import { CreateTotalFeeDto } from './dto/create-total-fee.dto';
import { UpdateTotalFeeDto } from './dto/update-total-fee.dto';
import { QueryTotalFreeDto } from './dto/query-total-fee.dto';

@Controller('total-fee')
export class TotalFeeController {
  constructor(private readonly totalFeeService: TotalFeeService) {}

  @Post()
  create(@Body() createTotalFeeDto: CreateTotalFeeDto) {
    return this.totalFeeService.create(createTotalFeeDto);
  }

  @Get()
  findAll(@Query() query: QueryTotalFreeDto) {
    return this.totalFeeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.totalFeeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTotalFeeDto: UpdateTotalFeeDto,
  ) {
    return this.totalFeeService.update(+id, updateTotalFeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.totalFeeService.remove(+id);
  }
}
