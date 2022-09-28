import { Injectable } from '@nestjs/common';
import { CreateTotalFeeDto } from './dto/create-total-fee.dto';
import { UpdateTotalFeeDto } from './dto/update-total-fee.dto';

@Injectable()
export class TotalFeeService {
  create(createTotalFeeDto: CreateTotalFeeDto) {
    return 'This action adds a new totalFee';
  }

  findAll() {
    return `This action returns all totalFee`;
  }

  findOne(id: number) {
    return `This action returns a #${id} totalFee`;
  }

  update(id: number, updateTotalFeeDto: UpdateTotalFeeDto) {
    return `This action updates a #${id} totalFee`;
  }

  remove(id: number) {
    return `This action removes a #${id} totalFee`;
  }
}
