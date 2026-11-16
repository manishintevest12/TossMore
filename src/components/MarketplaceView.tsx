import React, { useMemo, useState } from 'react';
import {
  Minus,
  Package,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CartItem,
  LanguageCode,
  MarketplaceProduct,
  SportType,
  TransactionRecord,
  YouTubeLiveStream,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { YouTubeLivePodcastSection } from './YouTubeLivePodcastSection';

interface MarketplaceViewProps {
  language: LanguageCode;
  products: MarketplaceProduct[];
  cart: CartItem[];
  transactions?: TransactionRecord[];
  youtubeStreams: YouTubeLiveStream[];
  activeYoutubeStreamId: string;
  onActivateYoutubeStream: (id: string) => Promise<void>;
  onSendYoutubeChat: (streamId: string, text: string) => Promise<void>;
  onAddYoutubeStream: (payload: {
    urlOrId: string;
    title: string;
    channelName: string;
    sport: SportType;
    hostAndGuest: string;
  }) => Promise<void>;
  onAddToCart: (product: MarketplaceProduct) => void;
  onUpdateCartQuantity: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onCheckoutCart: () => void;
  onCreateListing: (payload: {
    title: string;
    category: MarketplaceProduct['category'];
    sport: SportType;
    condition: 'New' | 'Pro-Used';
    priceUsd: number;
    specs: string;
  }) => Promise<void>;
}

const SPORT_FILTERS: ('All' | SportType)[] = [
  'All',
  'Cricket',
  'Football',
  'Kabaddi',
  'Golf',
  'Tennis',
  'Basketball',
  'Badminton',
  'Athletics',
];

const CATEGORY_FILTERS: ('All' | MarketplaceProduct['category'])[] = [
  'All',
  'Bats & Blades',
  'Balls & Shuttles',
  'Protective & Gloves',
  'Rackets & Clubs',
  'Footwear & Turf',
  'Training Machines',
  'Kabaddi & Mat Gear',
  'Smart Sensors',
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  language,
  products,
  cart,
  transactions = [],
  youtubeStreams,
  activeYoutubeStreamId,
  onActivateYoutubeStream,
  onSendYoutubeChat,
  onAddYoutubeStream,
  onAddToCart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onCheckoutCart,
  onCreateListing,
}) => {
  const t = TRANSLATIONS[language];
  const [sportFilter, setSportFilter] = useState<'All' | SportType>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | MarketplaceProduct['category']>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);

  // Sell form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MarketplaceProduct['category']>('Balls & Shuttles');
  const [sport, setSport] = useState<SportType>('Cricket');
  const [condition, setCondition] = useState<'New' | 'Pro-Used'>('New');
  const [priceUsd, setPriceUsd] = useState(120);
  const [specs, setSpecs] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (sportFilter !== 'All' && p.sport !== sportFilter) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.specs.toLowerCase().includes(q) &&
        !p.sport.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [products, sportFilter, categoryFilter, searchQuery]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.priceUsd * item.quantity, 0);
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreateListing({
      title: title.trim(),
      category,
      sport,
      condition,
      priceUsd,
      specs: specs.trim() || 'Inspected athlete gear · Ready for dispatch',
    });
    setTitle('');
    setSpecs('');
    setShowSellModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 [text-wrap:balance]">
            {t.sections.marketplaceHeadline}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Shop bats, match balls, gloves, rackets, footwear, and smart sensors across Cricket, Football, Kabaddi, Golf, Tennis, Basketball, Badminton, and Athletics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSellModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Sell Equipment</span>
        </button>
      </div>

      {/* Search + Sport & Category Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bats, balls, gloves, bowling machine, batting machine..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Showing {filtered.length} of {products.length} verified products
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SPORT_FILTERS.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setSportFilter(sp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                sportFilter === sp
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'All' ? 'All Gear Types' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Live Podcast from YouTube on Ecommerce */}
      <YouTubeLivePodcastSection
        context="ecommerce"
        streams={youtubeStreams}
        activeStreamId={activeYoutubeStreamId}
        products={products}
        onActivateStream={onActivateYoutubeStream}
        onSendChat={onSendYoutubeChat}
        onAddStream={onAddYoutubeStream}
        onAddFeaturedProduct={onAddToCart}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700">
                No gear matched your current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSportFilter('All');
                  setCategoryFilter('All');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Reset All Store Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(item)}
                      className="block w-full aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-200 text-left"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 p-6 text-center">
                          <Package className="h-9 w-9 text-slate-400 mb-2" />
                          <div className="text-xs font-semibold text-slate-700">{item.category}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.sport} · {item.condition}
                          </div>
                        </div>
                      )}
                    </button>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {item.sport} · {item.category} · {item.condition}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 tabular-nums shrink-0">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {item.sellerRating.toFixed(1)} ({item.reviewCount})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(item)}
                        className="text-left font-display text-base font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
                      >
                        {item.title}
                      </button>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.specs}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Seller: {item.sellerName}</span>
                        <span className="font-mono tabular-nums text-emerald-700">
                          {item.inStock} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                      ${item.priceUsd}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(item)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                      >
                        Specs
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToCart(item)}
                        className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Order Cart & Recent Purchases */}
        <div className="lg:col-span-4 space-y-5">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
                <h2 className="font-display text-lg font-semibold text-slate-900">Order Cart</h2>
              </div>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {totalItemsInCart} items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Your gear cart is empty. Add bats, balls, gloves, or rackets to checkout securely.
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                  {cart.map((entry) => (
                    <div key={entry.product.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {entry.product.title}
                        </div>
                        <div className="text-xs text-slate-500 font-mono tabular-nums">
                          ${entry.product.priceUsd} × {entry.quantity} = ${entry.product.priceUsd * entry.quantity}
                        </div>
                        <div className="inline-flex items-center gap-1 pt-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(entry.product.id, -1)}
                            aria-label={`Decrease ${entry.product.title}`}
                            className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono text-xs px-1.5 tabular-nums">
                            {entry.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(entry.product.id, 1)}
                            aria-label={`Increase ${entry.product.title}`}
                            className="rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveFromCart(entry.product.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        aria-label={`Remove ${entry.product.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                  {cartTotal >= 100
                    ? 'Free Express Athlete Shipping & Escrow Protection unlocked'
                    : `Add $${100 - cartTotal} more for Free Express Athlete Shipping`}
                </div>

                <div className="border-t border-slate-200 pt-3 flex items-center justify-between font-semibold text-slate-900">
                  <span className="text-sm">Total</span>
                  <span className="font-mono text-lg tabular-nums">${cartTotal}</span>
                </div>

                <button
                  type="button"
                  onClick={onCheckoutCart}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {t.actions.checkout} (${cartTotal})
                </button>
              </>
            )}

            {transactions.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Recent Verified Orders</span>
                </div>
                <div className="space-y-2">
                  {transactions.slice(0, 3).map((tx) => (
                    <div
                      key={tx.id}
                      className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs space-y-0.5"
                    >
                      <div className="font-medium text-slate-900 truncate">{tx.description}</div>
                      <div className="flex items-center justify-between text-slate-500 font-mono tabular-nums">
                        <span>{tx.referenceCode}</span>
                        <span className="font-semibold text-emerald-700">${tx.amountUsd} · {tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Quick-View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="text-xs font-medium text-slate-500">
                {selectedProduct.sport} · {selectedProduct.category} · {selectedProduct.condition}
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close product specs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-[4/3] bg-slate-100 border-b md:border-b-0 md:border-r border-slate-200">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {selectedProduct.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800 tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {selectedProduct.sellerRating.toFixed(1)} ({selectedProduct.reviewCount} reviews)
                    </span>
                    <span>·</span>
                    <span>{selectedProduct.sellerName}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedProduct.specs}
                  </p>
                  <div className="text-xs font-mono text-emerald-700 tabular-nums">
                    {selectedProduct.inStock} units ready for immediate dispatch
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    ${selectedProduct.priceUsd}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                List Sports Equipment for Sale
              </h3>
              <button
                type="button"
                onClick={() => setShowSellModal(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSellSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Pro Batting Gloves, Match Football, or Forged Driver"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as MarketplaceProduct['category'])
                    }
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-900"
                  >
                    <option value="Bats & Blades">Bats & Blades</option>
                    <option value="Balls & Shuttles">Balls & Shuttles</option>
                    <option value="Protective & Gloves">Protective & Gloves</option>
                    <option value="Rackets & Clubs">Rackets & Clubs</option>
                    <option value="Footwear & Turf">Footwear & Turf</option>
                    <option value="Training Machines">Training Machines</option>
                    <option value="Kabaddi & Mat Gear">Kabaddi & Mat Gear</option>
                    <option value="Smart Sensors">Smart Sensors</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Sport</label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value as SportType)}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-900"
                  >
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football</option>
                    <option value="Kabaddi">Kabaddi</option>
                    <option value="Golf">Golf</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Athletics">Athletics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as 'New' | 'Pro-Used')}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-900"
                  >
                    <option value="New">New</option>
                    <option value="Pro-Used">Pro-Used</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Specs & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Condition, size, weight, grip..."
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
