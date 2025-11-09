import { create } from 'zustand'

// Types
export interface Material {
  id: number
  name: string
  description: string
  material_type: string
  color_hex: string
  price: string
  image_url: string | null
  specifications: any
}

export interface WatchCase {
  id: number
  name: string
  description: string
  material_id: number
  shape: string
  color_hex: string
  size_mm: string
  price: string
  image_url: string | null
  specifications: any
}

export interface WatchDial {
  id: number
  name: string
  description: string
  style_category: string
  color_hex: string
  pattern_type: string
  price: string
  image_url: string | null
  material_id: number
  specifications: any
}

export interface WatchHands {
  id: number
  name: string
  description: string
  style: string
  color: string
  material_type: string
  size_mm: string
  price: string
  image_url: string | null
  specifications: any
}

export interface WatchStrap {
  id: number
  name: string
  description: string
  material_type: string
  color: string
  style: string
  buckle_type: string
  price: string
  image_url: string | null
  specifications: any
}

export interface WatchConfiguration {
  case: WatchCase | null
  dial: WatchDial | null
  hands: WatchHands | null
  strap: WatchStrap | null
  material: Material | null
}

export interface CartItem {
  id: string
  configuration: WatchConfiguration
  quantity: number
  totalPrice: number
  savedAt: string
}

interface ConfiguratorStore {
  // Configuration state
  currentConfiguration: WatchConfiguration
  
  // Available options
  materials: Material[]
  cases: WatchCase[]
  dials: WatchDial[]
  hands: WatchHands[]
  straps: WatchStrap[]
  
  // Cart state
  cart: CartItem[]
  
  // Actions
  setMaterial: (material: Material) => void
  setCase: (watchCase: WatchCase) => void
  setDial: (dial: WatchDial) => void
  setHands: (hands: WatchHands) => void
  setStrap: (strap: WatchStrap) => void
  
  // Options loading
  setMaterials: (materials: Material[]) => void
  setCases: (cases: WatchCase[]) => void
  setDials: (dials: WatchDial[]) => void
  setHandsOptions: (hands: WatchHands[]) => void
  setStraps: (straps: WatchStrap[]) => void
  
  // Cart actions
  addToCart: () => void
  removeFromCart: (id: string) => void
  updateCartItemQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  
  // Computed
  getTotalPrice: () => number
  getCartTotal: () => number
  getCartItemCount: () => number
  
  // Reset
  resetConfiguration: () => void
}

const initialConfiguration: WatchConfiguration = {
  case: null,
  dial: null,
  hands: null,
  strap: null,
  material: null,
}

export const useConfiguratorStore = create<ConfiguratorStore>()((set, get) => ({
  // Initial state
  currentConfiguration: initialConfiguration,
  materials: [],
  cases: [],
  dials: [],
  hands: [],
  straps: [],
  cart: [],

  // Configuration actions
  setMaterial: (material) =>
    set((state) => ({
      currentConfiguration: { ...state.currentConfiguration, material },
    })),

  setCase: (watchCase) =>
    set((state) => ({
      currentConfiguration: { ...state.currentConfiguration, case: watchCase },
    })),

  setDial: (dial) =>
    set((state) => ({
      currentConfiguration: { ...state.currentConfiguration, dial },
    })),

  setHands: (hands) =>
    set((state) => ({
      currentConfiguration: { ...state.currentConfiguration, hands },
    })),

  setStrap: (strap) =>
    set((state) => ({
      currentConfiguration: { ...state.currentConfiguration, strap },
    })),

  // Options loading
  setMaterials: (materials) => set({ materials }),
  setCases: (cases) => set({ cases }),
  setDials: (dials) => set({ dials }),
  setHandsOptions: (hands) => set({ hands }),
  setStraps: (straps) => set({ straps }),

  // Cart actions
  addToCart: () => {
    const { currentConfiguration } = get()
    const totalPrice = get().getTotalPrice()
    
    if (!currentConfiguration.case || !currentConfiguration.dial) {
      alert('Por favor selecciona al menos una caja y una esfera')
      return
    }

    const cartItem: CartItem = {
      id: `config-${Date.now()}`,
      configuration: currentConfiguration,
      quantity: 1,
      totalPrice,
      savedAt: new Date().toISOString(),
    }

    set((state) => ({
      cart: [...state.cart, cartItem],
    }))
  },

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),

  updateCartItemQuantity: (id, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ cart: [] }),

  // Computed values
  getTotalPrice: () => {
    const { currentConfiguration } = get()
    let total = 0

    if (currentConfiguration.material) total += parseFloat(currentConfiguration.material.price)
    if (currentConfiguration.case) total += parseFloat(currentConfiguration.case.price)
    if (currentConfiguration.dial) total += parseFloat(currentConfiguration.dial.price)
    if (currentConfiguration.hands) total += parseFloat(currentConfiguration.hands.price)
    if (currentConfiguration.strap) total += parseFloat(currentConfiguration.strap.price)

    return total
  },

  getCartTotal: () => {
    const { cart } = get()
    return cart.reduce((total, item) => total + item.totalPrice * item.quantity, 0)
  },

  getCartItemCount: () => {
    const { cart } = get()
    return cart.reduce((count, item) => count + item.quantity, 0)
  },

  // Reset
  resetConfiguration: () => set({ currentConfiguration: initialConfiguration }),
}))
