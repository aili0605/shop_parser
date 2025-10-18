import {
  insertNewBrand,
  insertNewCategory,
  insertNewProduct,
} from "../data_acces/repository.js";

/**
 * Сохраняет один продукт в базу
 * @param {Object} productData - объект с данными о товаре
 * @param {number|string} categoryName - название категории (например "Обувь")
 */
export async function saveProduct(productData, categoryName) {
  try {
    if (!productData.title){
      console.warn("Пропущен товар без названия");
      return;
    }
    const brandName = productData.brand?.trim() || "Unknown";
    const brandId = await insertNewBrand(brandName);

    const categoryId = await insertNewCategory(categoryName);

    const productId = await insertNewProduct(
      productData.title?.trim() || "No title",
      brandId,
      categoryId,
      productData.price || 0,
      productData.link || "",
      productData.img || ""
    );

    if (created) {
      console.log("Товар добавлен в базу: ${productData.title}");
    }  else{
      console.log("Уже существует: ${productData.title} ")
    }
    
    return productId;
  } catch (error) {
    console.error("Ошибка при сохранении товара:", error.message);
  }
}
