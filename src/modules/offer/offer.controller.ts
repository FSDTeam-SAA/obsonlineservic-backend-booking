import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { QueryOfferDto } from './dto/query-offer.dto';
import { ValidateOfferDto } from './dto/validate-offer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RoleType } from '../../common/enums/role.enum';

@ApiTags('Offers')
@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List promotional offers with search, type, and status filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Offers list fetched' })
  findAll(@Query() query: QueryOfferDto) {
    return this.offerService.findAll(query);
  }

  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get live active offers running this season' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Active offers list' })
  findActive() {
    return this.offerService.findActive();
  }

  @Public()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a promo code and compute booking discount' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Code valid and discount calculated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid code or terms not met' })
  validateCode(@Body() dto: ValidateOfferDto) {
    return this.offerService.validateCode(dto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get offer details by ID' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Offer details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Offer not found' })
  findOne(@Param('id') id: string) {
    return this.offerService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Create a new promotional offer' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Offer created' })
  create(@Body() dto: CreateOfferDto) {
    return this.offerService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] Update an offer' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Offer updated' })
  update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.offerService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete an offer' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Offer deleted' })
  remove(@Param('id') id: string) {
    return this.offerService.remove(id);
  }
}
