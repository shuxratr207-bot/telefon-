import { Product, ProductColor, ProductVariant } from '../types/index.ts';

export function normalizeOption(val?: string): string {
  if (!val) return '';
  return String(val)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/ram$/i, '')
    .replace(/unified$/i, '')
    .replace(/lpddr5x$/i, '')
    .replace(/ram-vita$/i, '')
    .trim();
}

export function guessColorHex(name?: string, fallback = '#3B82F6'): string {
  if (!name) return fallback;
  const lower = name.toLowerCase();
  if (lower.includes('qora') || lower.includes('black') || lower.includes('midnight') || lower.includes('obsidian') || lower.includes('dark') || lower.includes('xuan')) {
    return '#18181B';
  }
  if (lower.includes('oq') || lower.includes('white') || lower.includes('porcelain') || lower.includes('starlight') || lower.includes('milk')) {
    return '#F8FAFC';
  }
  if (lower.includes('ko‘k') || lower.includes("ko'k") || lower.includes('kok') || lower.includes('blue') || lower.includes('indigo') || lower.includes('navy') || lower.includes('cobalt')) {
    return '#1E3A8A';
  }
  if (lower.includes('tabiiy titan') || lower.includes('natural') || lower.includes('cosmic') || lower.includes('titan') || lower.includes('gray') || lower.includes('grey')) {
    return '#8E8D8A';
  }
  if (lower.includes('oltin') || lower.includes('gold') || lower.includes('desert') || lower.includes('mocha')) {
    return '#D4AF37';
  }
  if (lower.includes('kumush') || lower.includes('silver')) {
    return '#CBD5E1';
  }
  if (lower.includes('binafsha') || lower.includes('violet') || lower.includes('purple')) {
    return '#6D28D9';
  }
  if (lower.includes('yashil') || lower.includes('green') || lower.includes('emerald') || lower.includes('mint') || lower.includes('teal') || lower.includes('wintergreen')) {
    return '#059669';
  }
  if (lower.includes('pushti') || lower.includes('pink') || lower.includes('rose') || lower.includes('peach')) {
    return '#F472B6';
  }
  if (lower.includes('moviy') || lower.includes('cyan') || lower.includes('sky')) {
    return '#06B6D4';
  }
  if (lower.includes('jigarrang') || lower.includes('brown')) {
    return '#7C2D12';
  }
  return fallback;
}

export function getProductColors(product: Product): ProductColor[] {
  const map = new Map<string, ProductColor>();

  if (Array.isArray(product.colors)) {
    for (const c of product.colors) {
      if (c && c.name && c.name.trim()) {
        const key = c.name.trim().toLowerCase();
        map.set(key, {
          name: c.name.trim(),
          hex: c.hex || guessColorHex(c.name),
          image: c.image || product.images?.[0],
        });
      }
    }
  }

  if (Array.isArray(product.variants)) {
    for (const v of product.variants) {
      if (v && v.color && v.color.trim()) {
        const key = v.color.trim().toLowerCase();
        const existing = map.get(key);
        if (!existing) {
          map.set(key, {
            name: v.color.trim(),
            hex: v.colorHex || guessColorHex(v.color),
            image: v.image || product.images?.[0],
          });
        } else if (v.image && !existing.image) {
          existing.image = v.image;
        }
      }
    }
  }

  return Array.from(map.values());
}

export function getProductStorages(product: Product): string[] {
  const seen = new Map<string, string>();
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    for (const v of product.variants) {
      if (v && v.storage && v.storage.trim()) {
        const norm = normalizeOption(v.storage);
        if (!seen.has(norm)) seen.set(norm, v.storage.trim());
      }
    }
  }
  if (Array.isArray(product.storage)) {
    for (const s of product.storage) {
      if (s && s.trim()) {
        const norm = normalizeOption(s);
        if (!seen.has(norm)) seen.set(norm, s.trim());
      }
    }
  }
  return Array.from(seen.values());
}

export function getProductRams(product: Product): string[] {
  const seen = new Map<string, string>();
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    for (const v of product.variants) {
      if (v && v.ram && v.ram.trim()) {
        const norm = normalizeOption(v.ram);
        if (!seen.has(norm)) seen.set(norm, v.ram.trim());
      }
    }
  }
  if (Array.isArray(product.ram)) {
    for (const r of product.ram) {
      if (r && r.trim()) {
        const norm = normalizeOption(r);
        if (!seen.has(norm)) seen.set(norm, r.trim());
      }
    }
  }
  return Array.from(seen.values());
}

export function getProductModels(product: Product): string[] {
  const seen = new Map<string, string>();
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    for (const v of product.variants) {
      if (v && v.model && v.model.trim()) {
        const norm = normalizeOption(v.model);
        if (!seen.has(norm)) seen.set(norm, v.model.trim());
      }
    }
  }
  if (Array.isArray(product.models)) {
    for (const m of product.models) {
      if (m && m.trim()) {
        const norm = normalizeOption(m);
        if (!seen.has(norm)) seen.set(norm, m.trim());
      }
    }
  }
  return Array.from(seen.values());
}

export interface VariantSelection {
  color?: string;
  storage?: string;
  ram?: string;
  model?: string;
}

export interface ResolvedVariantResult {
  color: string;
  storage: string;
  ram: string;
  model: string;
  price: number;
  oldPrice?: number;
  stock: number;
  image: string;
  matchedVariant?: ProductVariant;
}

export function resolveProductVariant(
  product: Product,
  selection?: VariantSelection
): ResolvedVariantResult {
  const colors = getProductColors(product);
  const storages = getProductStorages(product);
  const rams = getProductRams(product);
  const models = getProductModels(product);

  const selectedColor = selection?.color || colors[0]?.name || '';
  const selectedStorage = selection?.storage || storages[0] || '';
  const selectedRam = selection?.ram !== undefined ? selection.ram : rams[0] || '';
  const selectedModel = selection?.model !== undefined ? selection.model : models[0] || '';

  const colorObj = colors.find(
    (c) => normalizeOption(c.name) === normalizeOption(selectedColor)
  );
  let resolvedImage = colorObj?.image || product.images?.[0] || '';

  const variants = Array.isArray(product.variants) ? product.variants : [];

  if (variants.length > 0) {
    const normColor = normalizeOption(selectedColor);
    const normStorage = normalizeOption(selectedStorage);
    const normRam = normalizeOption(selectedRam);
    const normModel = normalizeOption(selectedModel);

    // 1. Try exact match where every specified field on variant matches selection
    const exactMatch = variants.find((v) => {
      const cMatch = !v.color || !normColor || normalizeOption(v.color) === normColor;
      const sMatch = !v.storage || !normStorage || normalizeOption(v.storage) === normStorage;
      const rMatch = !v.ram || !normRam || normalizeOption(v.ram) === normRam;
      const mMatch = !v.model || !normModel || normalizeOption(v.model) === normModel;
      return cMatch && sMatch && rMatch && mMatch;
    });

    if (exactMatch) {
      const price = Number(exactMatch.price) > 0 ? Number(exactMatch.price) : product.price;
      const priceDiff = price - product.price;
      const oldPrice =
        exactMatch.oldPrice && exactMatch.oldPrice > price
          ? exactMatch.oldPrice
          : product.oldPrice > product.price
          ? product.oldPrice + Math.max(0, priceDiff)
          : undefined;
      return {
        color: selectedColor,
        storage: selectedStorage,
        ram: selectedRam || exactMatch.ram || '',
        model: selectedModel || exactMatch.model || '',
        price,
        oldPrice,
        stock: exactMatch.stock !== undefined ? Number(exactMatch.stock) : product.stock,
        image: exactMatch.image || resolvedImage,
        matchedVariant: exactMatch,
      };
    }

    // 2. Try matching color + storage + model (if RAM differed)
    const colorStorageModelMatch = variants.find((v) => {
      const cMatch = !v.color || !normColor || normalizeOption(v.color) === normColor;
      const sMatch = !v.storage || !normStorage || normalizeOption(v.storage) === normStorage;
      const mMatch = !v.model || !normModel || normalizeOption(v.model) === normModel;
      return cMatch && sMatch && mMatch;
    });

    // 3. Try matching color + storage
    const colorStorageMatch =
      colorStorageModelMatch ||
      variants.find((v) => {
        const cMatch = !v.color || !normColor || normalizeOption(v.color) === normColor;
        const sMatch = !v.storage || !normStorage || normalizeOption(v.storage) === normStorage;
        return cMatch && sMatch;
      });

    // 4. Try matching storage + model or storage alone for price reference
    const storagePriceMatch =
      variants.find(
        (v) =>
          normalizeOption(v.storage) === normStorage &&
          (!v.model || !normModel || normalizeOption(v.model) === normModel) &&
          (!v.ram || !normRam || normalizeOption(v.ram) === normRam)
      ) ||
      variants.find((v) => normalizeOption(v.storage) === normStorage);

    const bestPriceVariant = colorStorageMatch || storagePriceMatch || variants[0];
    const storageIdx = Math.max(
      0,
      storages.findIndex((s) => normalizeOption(s) === normStorage)
    );
    const ramIdx = Math.max(
      0,
      rams.findIndex((r) => normalizeOption(r) === normRam)
    );
    const modelIdx = Math.max(
      0,
      models.findIndex((m) => normalizeOption(m) === normModel)
    );

    let price = bestPriceVariant ? Number(bestPriceVariant.price) : product.price + storageIdx * 100;
    // If bestPriceVariant didn't account for a higher model or RAM tier when not explicitly matched:
    if (bestPriceVariant && normModel && bestPriceVariant.model && normalizeOption(bestPriceVariant.model) !== normModel) {
      const baseModelIdx = Math.max(0, models.findIndex((m) => normalizeOption(m) === normalizeOption(bestPriceVariant.model)));
      price += (modelIdx - baseModelIdx) * 100;
    }
    if (bestPriceVariant && normRam && bestPriceVariant.ram && normalizeOption(bestPriceVariant.ram) !== normRam) {
      const baseRamIdx = Math.max(0, rams.findIndex((r) => normalizeOption(r) === normalizeOption(bestPriceVariant.ram)));
      price += (ramIdx - baseRamIdx) * 50;
    }

    const priceDiff = price - product.price;
    const oldPrice =
      product.oldPrice > product.price ? product.oldPrice + Math.max(0, priceDiff) : undefined;

    const resolvedStock = colorStorageMatch
      ? Number(colorStorageMatch.stock)
      : storagePriceMatch
      ? Number(storagePriceMatch.stock)
      : product.stock;

    const colorVariantWithImg = variants.find(
      (v) => v.image && normalizeOption(v.color) === normColor
    );

    return {
      color: selectedColor,
      storage: selectedStorage,
      ram: selectedRam,
      model: selectedModel,
      price: Math.max(1, price),
      oldPrice,
      stock: Math.max(0, resolvedStock),
      image: colorStorageMatch?.image || colorVariantWithImg?.image || resolvedImage,
      matchedVariant: colorStorageMatch || storagePriceMatch,
    };
  }

  // Fallback when product has no explicit variants array
  const storageIndex = Math.max(
    0,
    storages.findIndex((s) => normalizeOption(s) === normalizeOption(selectedStorage))
  );
  const ramIndex = Math.max(
    0,
    rams.findIndex((r) => normalizeOption(r) === normalizeOption(selectedRam))
  );
  const modelIndex = Math.max(
    0,
    models.findIndex((m) => normalizeOption(m) === normalizeOption(selectedModel))
  );

  const finalPrice = product.price + storageIndex * 100 + ramIndex * 50 + modelIndex * 100;
  const hasValidOldPrice = Boolean(product.oldPrice && product.oldPrice > product.price);
  const finalOldPrice = hasValidOldPrice
    ? product.oldPrice + storageIndex * 100 + ramIndex * 50 + modelIndex * 100
    : undefined;

  return {
    color: selectedColor,
    storage: selectedStorage,
    ram: selectedRam,
    model: selectedModel,
    price: finalPrice,
    oldPrice: finalOldPrice,
    stock: product.stock,
    image: resolvedImage,
  };
}
