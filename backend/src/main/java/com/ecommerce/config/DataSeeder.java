package com.ecommerce.config;

import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/** Inserts demo categories and products only when the collections are empty. */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            categoryRepository.saveAll(List.of(
                    category("Electronics", "Phones, audio and everyday gadgets"),
                    category("Clothing", "Comfortable everyday apparel"),
                    category("Shoes", "Sneakers and running shoes"),
                    category("Accessories", "Bags, watches and small essentials"),
                    category("Home", "Practical pieces for your living space")));
            log.info("Seeded categories");
        }
        if (productRepository.count() == 0) {
            productRepository.saveAll(List.of(
                    product("Aurora X5 Smartphone", "6.5 inch AMOLED display, 128 GB storage, 50 MP camera and a two-day battery.", 24999, "Electronics", "aurora-phone", 40, 4.5),
                    product("Pulse ANC Wireless Headphones", "Active noise cancelling, 30 hour battery life and fast USB-C charging.", 6499, "Electronics", "pulse-headphones", 60, 4.6),
                    product("Nimbus 14 Laptop", "14 inch FHD display, 16 GB RAM, 512 GB SSD. Light enough to carry all day.", 58990, "Electronics", "nimbus-laptop", 8, 4.4),
                    product("Everyday Cotton T-Shirt", "Soft 100% combed cotton crew neck t-shirt in a relaxed fit.", 799, "Clothing", "cotton-tshirt", 150, 4.2),
                    product("Classic Denim Jacket", "Mid-weight denim jacket with button front and two chest pockets.", 2999, "Clothing", "denim-jacket", 35, 4.3),
                    product("Stride Run Sneakers", "Breathable mesh running shoes with a cushioned, grippy sole.", 3499, "Shoes", "run-sneakers", 70, 4.5),
                    product("Urban Leather Loafers", "Hand-finished leather loafers for work and weekends.", 4299, "Shoes", "leather-loafers", 5, 4.1),
                    product("Meridian Analog Watch", "Stainless steel case, sapphire-coated glass and a genuine leather strap.", 5499, "Accessories", "analog-watch", 25, 4.7),
                    product("Voyager Backpack 25L", "Water resistant daypack with a padded laptop sleeve and hidden pocket.", 1899, "Accessories", "backpack", 90, 4.4),
                    product("Lumen Desk Lamp", "Dimmable LED desk lamp with three colour temperatures and a USB port.", 1599, "Home", "desk-lamp", 45, 4.3),
                    product("Brew Master Coffee Maker", "Programmable 10-cup drip coffee maker with a reusable filter.", 3299, "Home", "coffee-maker", 3, 4.0),
                    product("Linen Throw Blanket", "Washed linen blend throw, light enough for summer and cosy in winter.", 1299, "Home", "throw-blanket", 55, 4.2)));
            log.info("Seeded products");
        }
    }

    private Category category(String name, String description) {
        return Category.builder().name(name).description(description).build();
    }

    private Product product(String name, String description, double price, String category, String seed, int stock, double rating) {
        Instant now = Instant.now();
        return Product.builder()
                .name(name).description(description).price(price).category(category)
                .imageUrl("https://picsum.photos/seed/" + seed + "/600/600")
                .stock(stock).rating(rating).createdAt(now).updatedAt(now)
                .build();
    }
}
