import db from "../models/index.cjs";
const { sequelize, Brand, Category, Product, User, Wishlist, Notifications  } = db;

export async function insertNewBrand(brandName) {
  if (!brandName || !brandName.trim()) brandName = "Unknown";

  const slug = brandName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");


  const [brand] = await Brand.findOrCreate({
    where: { name: brandName },
    defaults: {
      name: brandName,
      slug: slug,
    },
  });

  return brand.id;
}

export async function insertNewCategory(categoryName) {
    const [category] = await Category.findOrCreate({
        where: { name: categoryName },
        defaults : { name: categoryName }
    })
    return category.id;
}

export async function insertNewProduct(title, brandId, categoryId, price, link, img) {
  try {
    const [product, created] = await Product.findOrCreate({
      where: { name: title, url: link },
      defaults: {
        name: title,
        brand_id: brandId,
        category_id: categoryId,
        price,
        url: link,
        image_url: img,   
        currency: "USD",  
        description: ""   
      }
    });

    if (created) {
      console.log(`Новый товар добавлен: ${title}`);
    } else {
      console.log(`Уже существует: ${title}`);
    }

    return product.id;
  } catch (err) {
    console.error("Ошибка при вставке товара:", err.message);
  }
}

export async function insertNewUser(userName) {
  const [user, created] = await User.findOrCreate({
    where: { name: userName},
    defaults: { name: userName}
  });
  return user.id;
}

export async function insertNewWishlist(wishlistName) {
  const [wishlist, created] = await Wishlist.findOrCreate({
    where: { name: wishlistName},
    defaults: { name: wishlistName}
  });
  return wishlist.id;
}

export async function insertNewNotification(notificationName) {
  const [notification, created] = await Notifications.findOrCreate({
    where: { name: notificationName },
    defaults: { name: notificationName}
  });
  return notification.id;
}
