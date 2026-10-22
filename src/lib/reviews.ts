/**
 * Product reviews shown on each product page.
 * Every product gets 5 reviews: 4 female names and 1 male name (80:20).
 * Selection is deterministic per product code, so a product always shows
 * the same reviews across visits.
 */

const FEMALE_NAMES = [
  "Priya Sharma", "Anjali Patel", "Neha Desai", "Kavya Iyer", "Meera Nair",
  "Sneha Reddy", "Ritu Verma", "Pooja Mehta", "Divya Kulkarni", "Ishita Joshi",
  "Aarti Gupta", "Nisha Rao", "Shreya Bhatt", "Tanvi Shah", "Lakshmi Menon",
  "Fatima Khan", "Simran Kaur", "Riya Malhotra", "Komal Thakkar", "Bhavna Trivedi",
];

const MALE_NAMES = ["Rahul Mehta", "Arjun Reddy", "Vikram Singh", "Karan Shah", "Aditya Joshi"];

const REVIEW_TEXTS = [
  "Great quality for the price. The {p} looks even better in person.",
  "Exactly as shown in the photos. Fit and finish are spot on.",
  "Ordered the {p} for myself and ended up buying another as a gift. Highly recommend.",
  "Lovely quality and packed neatly. You can tell care went into it.",
  "Arrived quickly and well packed. Very happy with the {p}.",
  "The {p} is well made, comfortable and exactly what I was looking for.",
  "Gifted this to a friend and they loved it. Thank you for the careful packaging.",
  "Excellent value. The details are great up close.",
  "Customer service answered my questions quickly before ordering. The {p} is just right.",
  "Stylish, simple and well finished. I keep getting compliments.",
];

export type ProductReview = { name: string; rating: number; message: string };

function hashCode(code: string): number {
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function getProductReviews(code: string, productName: string): ProductReview[] {
  const h = hashCode(code);
  const female: ProductReview[] = [];

  for (let k = 0; k < 4; k++) {
    const name = FEMALE_NAMES[(h + k * 5) % FEMALE_NAMES.length];
    const message = REVIEW_TEXTS[(h + k * 3) % REVIEW_TEXTS.length].replace("{p}", productName);
    const rating = (h + k) % 3 === 0 ? 4 : 5;
    female.push({ name, rating, message });
  }

  const male: ProductReview = {
    name: MALE_NAMES[h % MALE_NAMES.length],
    rating: h % 4 === 0 ? 4 : 5,
    message: REVIEW_TEXTS[(h + 7) % REVIEW_TEXTS.length].replace("{p}", productName),
  };

  // Place the single male review at a varying position
  const out = [...female];
  out.splice(h % 5, 0, male);
  return out;
}
