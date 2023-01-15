import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import JwtAuthenticationGuard from '../authentication/jwt-authentication.guard';
import CartsService from './carts.service';
import RequestWithUser from '../authentication/requestWithUser.interface';
import { CreateCartDto } from './dto/createCart.dto';

@Controller('carts')
export default class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('new-cart')
  @UseGuards(JwtAuthenticationGuard)
  createNewCart(@Body() cart: CreateCartDto, @Req() request: RequestWithUser) {
    return this.cartsService.createCart(cart, request.user.id);
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  getActiveCart(@Req() request: RequestWithUser) {
    return this.cartsService.getActiveCart(request.user.id);
  }

  @Post('add-products')
  @UseGuards(JwtAuthenticationGuard)
  addProductsToCart(
    @Req() request: RequestWithUser,
    @Body() productsIdsArray: number[],
  ) {
    return this.cartsService.addProductsToCart(
      request.user.id,
      request.body.productsIds,
    );
  }

  @Post('finish-transaction')
  @UseGuards(JwtAuthenticationGuard)
  finishTransaction(@Req() request: RequestWithUser) {
    return this.cartsService.finishTransaction(request.user.id);
  }
}
