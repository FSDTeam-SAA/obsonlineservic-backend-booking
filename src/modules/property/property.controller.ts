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
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RoleType } from '../../common/enums/role.enum';

@ApiTags('Properties')
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List properties with category filtering, search, and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Properties fetched successfully' })
  findAll(@Query() query: QueryPropertyDto) {
    return this.propertyService.findAll(query);
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Get popular properties for homepage showcase' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Popular properties list' })
  findPopular() {
    return this.propertyService.findPopular();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get property details by ID' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property not found' })
  findOne(@Param('id') id: string) {
    return this.propertyService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Create a new property' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Property created' })
  create(@Body() dto: CreatePropertyDto) {
    return this.propertyService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] Update a property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property updated' })
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertyService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete a property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property deleted' })
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
