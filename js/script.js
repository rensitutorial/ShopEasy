
// ===================================
// 1. PRODUCT SEARCH AND FILTER
// ===================================

const products = document.querySelectorAll(".product-card");
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.querySelectorAll(".categories button");

let selectedCategory = "All";

function filterProducts() {
    const searchText = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    products.forEach(function(product) {
        const productName = product.querySelector("h3")
            ? product.querySelector("h3").textContent.toLowerCase()
            : "";

        const productCategory = product.getAttribute("data-category");

        const matchesSearch = productName.includes(searchText);
        const matchesCategory =
            selectedCategory === "All" ||
            productCategory === selectedCategory;

        product.style.display =
            matchesSearch && matchesCategory ? "flex" : "none";
    });
}

if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
}

categoryButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        selectedCategory = button.textContent.trim();
        filterProducts();
    });
});


// ===================================
// 2. ADD PRODUCTS TO CART
// ===================================

const addToCartButtons = document.querySelectorAll(".add-to-cart");

addToCartButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const productCard = button.closest(".product-card");

        const productName =
            productCard.querySelector("h3").textContent.trim();

        const priceText =
            productCard.querySelector("h4").textContent;

        const productPrice = parseInt(
            priceText.replace("₹", "").replace(/,/g, "")
        );

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existingItem = cart.find(function(item) {
            return item.name === productName;
        });

        if (existingItem) {
            existingItem.quantity =
                (Number(existingItem.quantity) || 1) + 1;
        } else {
            cart.push({
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        alert(productName + " added to cart!");
    });
});


// ===================================
// 3. DISPLAY CART ITEMS
// ===================================

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

function displayCart() {
    if (!cartItems || !cartTotal) {
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';

        cartTotal.textContent = "0";
        return;
    }

    cart.forEach(function(product, index) {
        product.quantity = Number(product.quantity) || 1;

        const itemTotal = Number(product.price) * product.quantity;
        total += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = "Price: ₹" + product.price;

        // Quantity controls
        const quantityBox = document.createElement("div");
        quantityBox.className = "quantity";

        const decreaseButton = document.createElement("button");
        decreaseButton.textContent = "−";
        decreaseButton.className = "decrease-btn";
        decreaseButton.dataset.index = index;

        const quantityText = document.createElement("span");
        quantityText.textContent = product.quantity;

        const increaseButton = document.createElement("button");
        increaseButton.textContent = "+";
        increaseButton.className = "increase-btn";
        increaseButton.dataset.index = index;

        quantityBox.appendChild(decreaseButton);
        quantityBox.appendChild(quantityText);
        quantityBox.appendChild(increaseButton);

        const subtotal = document.createElement("p");
        subtotal.textContent = "Subtotal: ₹" + itemTotal;

        // Remove button
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-btn";
        removeButton.dataset.index = index;

        cartItem.appendChild(name);
        cartItem.appendChild(price);
        cartItem.appendChild(quantityBox);
        cartItem.appendChild(subtotal);
        cartItem.appendChild(removeButton);

        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = total;

    // Increase quantity
    cartItems.querySelectorAll(".increase-btn").forEach(function(button) {
        button.addEventListener("click", function() {
            let currentCart =
                JSON.parse(localStorage.getItem("cart")) || [];

            const index = Number(button.dataset.index);

            currentCart[index].quantity =
                (Number(currentCart[index].quantity) || 1) + 1;

            localStorage.setItem("cart", JSON.stringify(currentCart));
            displayCart();
        });
    });

    // Decrease quantity
    cartItems.querySelectorAll(".decrease-btn").forEach(function(button) {
        button.addEventListener("click", function() {
            let currentCart =
                JSON.parse(localStorage.getItem("cart")) || [];

            const index = Number(button.dataset.index);

            currentCart[index].quantity =
                (Number(currentCart[index].quantity) || 1) - 1;

            if (currentCart[index].quantity <= 0) {
                currentCart.splice(index, 1);
            }

            localStorage.setItem("cart", JSON.stringify(currentCart));
            displayCart();
        });
    });

    // Remove individual product
    cartItems.querySelectorAll(".remove-btn").forEach(function(button) {
        button.addEventListener("click", function() {
            let currentCart =
                JSON.parse(localStorage.getItem("cart")) || [];

            const index = Number(button.dataset.index);
            currentCart.splice(index, 1);

            localStorage.setItem("cart", JSON.stringify(currentCart));
            displayCart();
        });
    });
}

displayCart();


// ===================================
// 4. CHECKOUT BUTTON
// ===================================

const checkoutButton = document.getElementById("checkoutButton");

if (checkoutButton) {
    checkoutButton.addEventListener("click", function() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        if (cart.length === 0) {
            alert("Your cart is empty!");
        } else {
            window.location.href = "checkout.html";
        }
    });
}


// ===================================
// 5. PRODUCT REVIEWS AND RATINGS
// ===================================

const reviewSections = document.querySelectorAll(".review-section");

reviewSections.forEach(function(section) {
    const productName = section.getAttribute("data-product");
    const reviewForm = section.querySelector(".review-form");
    const reviewList = section.querySelector(".review-list");

    const ratingDisplay = section
        .closest(".product-card")
        .querySelector(".average-rating");

    function getReviews() {
        let allReviews =
            JSON.parse(localStorage.getItem("productReviews")) || {};

        return allReviews[productName] || [];
    }

    // Display average rating
    function displayAverageRating() {
        const reviews = getReviews();

        if (!ratingDisplay) {
            return;
        }

        if (reviews.length === 0) {
            ratingDisplay.textContent = "No ratings yet";
            return;
        }

        let total = 0;

        reviews.forEach(function(review) {
            total += Number(review.rating);
        });

        const average = total / reviews.length;
        const stars = "⭐".repeat(Math.round(average));

        ratingDisplay.textContent =
            stars + " " + average.toFixed(1) +
            " (" + reviews.length +
            (reviews.length === 1 ? " review)" : " reviews)");
    }

    // Display customer reviews
    function displayReviews() {
        if (!reviewList) {
            return;
        }

        const reviews = getReviews();
        reviewList.innerHTML = "";

        if (reviews.length === 0) {
            reviewList.textContent = "No reviews yet.";
            displayAverageRating();
            return;
        }

        reviews.forEach(function(review) {
            const reviewItem = document.createElement("div");
            reviewItem.className = "review-item";

            const ratingText = document.createElement("p");
            ratingText.textContent =
                "⭐".repeat(Number(review.rating));

            const commentText = document.createElement("p");
            commentText.textContent = review.comment;

            reviewItem.appendChild(ratingText);
            reviewItem.appendChild(commentText);
            reviewList.appendChild(reviewItem);
        });

        displayAverageRating();
    }

    // Submit a review
    if (reviewForm) {
        reviewForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const rating = Number(
                section.querySelector(".review-rating").value
            );

            const comment = section
                .querySelector(".review-text")
                .value.trim();

            if (rating < 1 || rating > 5 || comment === "") {
                alert("Please select a rating and write a review.");
                return;
            }

            let allReviews =
                JSON.parse(localStorage.getItem("productReviews")) || {};

            if (!allReviews[productName]) {
                allReviews[productName] = [];
            }

            allReviews[productName].push({
                rating: rating,
                comment: comment
            });

            localStorage.setItem(
                "productReviews",
                JSON.stringify(allReviews)
            );

            alert("Your review has been submitted!");

            reviewForm.reset();
            displayReviews();
        });
    }

    displayReviews();
});


// ===================================
// 6. WISHLIST FEATURE
// ===================================

const wishlistButtons = document.querySelectorAll(".add-to-wishlist");

wishlistButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const productCard = button.closest(".product-card");

        const productName =
            productCard.querySelector("h3").textContent.trim();

        const priceText =
            productCard.querySelector("h4").textContent;

        const productPrice = parseInt(
            priceText.replace("₹", "").replace(/,/g, "")
        );

        const productImage =
            productCard.querySelector("img").src;

        let wishlist =
            JSON.parse(localStorage.getItem("wishlist")) || [];

        const alreadyAdded = wishlist.some(function(product) {
            return product.name === productName;
        });

        if (alreadyAdded) {
            alert("This product is already in your wishlist!");
            return;
        }

        wishlist.push({
            name: productName,
            price: productPrice,
            image: productImage
        });

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

        alert(productName + " added to wishlist! ❤️");
    });
});


// ===================================
// 7. DISPLAY WISHLIST
// ===================================

const wishlistItems = document.getElementById("wishlistItems");

function displayWishlist() {
    if (!wishlistItems) {
        return;
    }

    let wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    wishlistItems.innerHTML = "";

    if (wishlist.length === 0) {
        wishlistItems.innerHTML =
            "<p>Your wishlist is empty. ❤️";
        return;
    }

    wishlist.forEach(function(product, index) {
        const card = document.createElement("div");
        card.className = "product-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.style.width = "100%";
        image.style.height = "180px";
        image.style.objectFit = "contain";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("h4");
        price.textContent = "₹" + product.price;

        // Remove from wishlist
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove ❤️";
        removeButton.className = "remove-btn";

        removeButton.addEventListener("click", function() {
            let currentWishlist =
                JSON.parse(localStorage.getItem("wishlist")) || [];

            currentWishlist.splice(index, 1);

            localStorage.setItem(
                "wishlist",
                JSON.stringify(currentWishlist)
            );

            displayWishlist();
        });

        // Add wishlist product to cart
        const cartButton = document.createElement("button");
        cartButton.textContent = "Add to Cart 🛒";
        cartButton.className = "add-to-cart";

        cartButton.addEventListener("click", function() {
            let cart =
                JSON.parse(localStorage.getItem("cart")) || [];

            const existingItem = cart.find(function(item) {
                return item.name === product.name;
            });

            if (existingItem) {
                existingItem.quantity =
                    (Number(existingItem.quantity) || 1) + 1;
            } else {
                cart.push({
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }

            localStorage.setItem("cart", JSON.stringify(cart));

            alert(product.name + " added to cart!");
        });

        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(price);
        card.appendChild(cartButton);
        card.appendChild(removeButton);

        wishlistItems.appendChild(card);
    });
}

displayWishlist();


// ===================================
// 8. REMOVE ALL ITEMS FROM CART
// ===================================

function clearCart() {
    if (confirm("Are you sure you want to remove all items?")) {
        localStorage.removeItem("cart");

        if (cartItems) {
            cartItems.innerHTML =
                '<p class="empty-cart">Your cart is empty.</p>';
        }

        if (cartTotal) {
            cartTotal.textContent = "0";
        }

        alert("All items removed from cart!");
    }
}