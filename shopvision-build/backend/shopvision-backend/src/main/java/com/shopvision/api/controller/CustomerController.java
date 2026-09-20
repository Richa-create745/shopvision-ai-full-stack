package com.shopvision.api.controller;

import com.shopvision.api.dto.SearchDtos.*;
import com.shopvision.api.dto.ShoppingListDtos.*;
import com.shopvision.api.service.CustomerService;
import com.shopvision.api.service.GeminiService;
import com.shopvision.api.service.InventoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;
    private final InventoryService inventory;
    private final GeminiService geminiService;

    public CustomerController(
            CustomerService customerService,
            InventoryService inventory,
            GeminiService geminiService
    ) {
        this.customerService = customerService;
        this.inventory = inventory;
        this.geminiService = geminiService;
    }

    @PostMapping("/parse-shopping-list")
    public ParseShoppingListResponse parseShoppingList(
            @RequestBody ParseShoppingListRequest request
    ) {

        var products = geminiService.parseShoppingList(
                request.text()
        );

        return new ParseShoppingListResponse(products);
    }

    @PostMapping("/search")
    public SearchResponse search(
            @RequestBody SearchRequest request
    ) {
        return customerService.searchProducts(request);
    }

    @PostMapping("/verify-product")
    public VerifyProductResponse verifyProduct(
            @RequestBody VerifyProductRequest request
    ) {

        /*
         * Customer says YES / Got the product.
         *
         * Nothing needs to be removed from inventory.
         */
        if (Boolean.TRUE.equals(request.gotProduct())) {

            return new VerifyProductResponse(
                    true,
                    "Product confirmed by customer.",
                    null
            );
        }

        /*
         * Customer says NO.
         *
         * Remove the product ONLY from the shop
         * where the customer could not find it.
         */
        inventory.removeProductFromShop(
                request.productId(),
                request.shopId()
        );

        /*
         * Search the complete current checklist again.
         *
         * This allows the system to find the product
         * in another shop and recalculate the route.
         */
        SearchResponse updatedSearch =
                customerService.searchProducts(
                        new SearchRequest(
                                request.checklistId(),
                                request.products(),
                                request.latitude(),
                                request.longitude()
                        )
                );

        return new VerifyProductResponse(
                true,
                "Product removed from this shop inventory. Searching the checklist again.",
                updatedSearch
        );
    }
}