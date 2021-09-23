import path from 'path';
import fs from 'fs';

const dirname = path.resolve();

const inputDataPath = path.join(dirname, 'data', 'data.json');

const parsedData = JSON.parse(fs.readFileSync(inputDataPath));

function toNumber(str) {
  return Number(str.replace('$', '').replace(',', '.'));
}

function isString(key, data) {
  if (typeof data !== 'string') throw new Error(`Validation Error: field ${key} must be string.`);
}

function isNumber(key, data) {
  if (typeof data !== 'number') throw new Error(`Validation Error: field ${key} must be number`);
}

function isPrice(key, price) {
  isString(key, price);
  if (price[0] !== '$') throw new Error(`Validation Error: field ${key} must be Price`);
  if (Number.isNaN(Number(price.replace('$', '').replace(',', '.')))) throw new Error(`Validation Error: field ${key} must be Price`);
}

function validateProduct(product) {
  Object.entries(product).forEach(([key, value]) => {
    switch (key) {
      case 'item':
        isString(key, value);
        break;
      case 'type':
        isString(key, value);
        break;
      case 'weight':
        isNumber(key, value);
        break;
      case 'quantity':
        isNumber(key, value);
        break;
      case 'pricePerKilo':
        isPrice(key, value);
        break;
      case 'pricePerItem':
        isPrice(key, value);
        break;

      default:
        throw new Error(`Validation Error: not allowed field: ${key}`);
    }
  });
}

function validate(products) {
  products.forEach((product) => validateProduct(product));
}

function countAmountByItemName(products, itemName) {
  let count = 0;

  products.forEach((product) => {
    if (product.item === itemName) {
      count += (product.weight || product.quantity);
    }
  });

  return count;
}

function sortByItems(products) {
  return products.sort((a, b) => a.item.localeCompare(b.item));
}

function sortByPrice(products) {
  return products.sort((a, b) => {
    const priceA = a.pricePerKilo
      ? toNumber(a.pricePerKilo) * a.weight
      : toNumber(a.pricePerItem) * a.quantity;

    const priceB = b.pricePerKilo
      ? toNumber(b.pricePerKilo) * b.weight
      : toNumber(b.pricePerItem) * b.quantity;

    return priceA - priceB;
  });
}

function filterByItem(products, item) {
  return products.map((obj) => {
    if (obj.item === item) return obj;
    return undefined;
  }).filter(Boolean);
}

function logCheapestOranges(products) {
  const oranges = filterByItem(products, 'orange');
  const pricesOfOranges = oranges.map((orange) => toNumber(orange.pricePerKilo));
  const theLeastPrice = Math.min(...pricesOfOranges);

  return oranges.map((orange) => {
    if (toNumber(orange.pricePerKilo) === theLeastPrice) return orange.type;
    return undefined;
  }).filter(Boolean).join(', ');
}

function computePriceByAmount(product) {
  const amount = product.weight || product.quantity;
  const price = toNumber(product.pricePerKilo || product.pricePerItem);

  return amount * price;
}

function getCostByItemName(products) {
  const computedProducts = {};

  products.forEach((product) => {
    if (!(product.item in computedProducts)) computedProducts[product.item] = computePriceByAmount(product);
    else computedProducts[product.item] = computedProducts[product.item] + computePriceByAmount(product);
  });

  return computedProducts;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function main() {
  /**
   * Validate the data according to the following rules:
   * item: string,
   * type: string,
   * weight: number,
   * quantity: number,
   * pricePerKilo: “$” + number - string,
   * pricePerItem: “$” + number - string
   */
  validate(parsedData);

  // Print to the console the total quantity of all watermelons (Watermelons - ${quantity});
  console.log(`Watermelons - ${countAmountByItemName(parsedData, 'watermelon')}`);

  // Print to the console the total weight of all apples (Apples - ${weight});
  console.log(`Apples - ${countAmountByItemName(parsedData, 'apple')}`);

  // Sort the array in alphabetical order by item field and print it to the console;
  console.log(sortByItems(parsedData));

  // Sort the array by cost of the record and print it to the console;
  console.log(sortByPrice(parsedData));

  // Print to the terminal the type of oranges with the least price (The cheapest orange type is: ${type});
  console.log(`The cheapest orange type is: ${logCheapestOranges(parsedData)}`);

  /**
   * Print to the console the cost of the goods by item name
   * Apples - ${costApples},
   * Pineapples - ${costPineapples},
   * Watermelons - ${costWatermelons},
   * Oranges - ${costOranges};
   */
  Object.entries(getCostByItemName(parsedData)).forEach(([item, cost]) => console.log(`${capitalizeFirstLetter(`${item}s`)} - ${cost}`));
}

main();

// {item, type, [weight, quantity], [pricePerKilo, pricePerItem]}
