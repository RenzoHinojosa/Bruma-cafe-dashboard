import { useReducer } from 'react'

const initialOrders = [
  { id: 'BR-1042', guest: 'Mara Salvatierra', drink: 'Latte de avena', time: '09:18', status: 'En barra', total: 14.5, channel: 'Salón' },
  { id: 'BR-1041', guest: 'Daniel Rojas', drink: 'Cold brew tonic', time: '09:11', status: 'Listo', total: 16, channel: 'Para llevar' },
  { id: 'BR-1040', guest: 'Inés Valdez', drink: 'Cappuccino + croissant', time: '08:56', status: 'Nuevo', total: 19.5, channel: 'Salón' },
  { id: 'BR-1039', guest: 'Leo Chávez', drink: 'Matcha ceremonial', time: '08:42', status: 'Listo', total: 15, channel: 'Para llevar' },
]

function ordersReducer(state, action) {
  switch (action.type) {
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] }
    case 'REMOVE_ORDER':
      return { ...state, orders: state.orders.filter((order) => order.id !== action.payload) }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'SET_SORT':
      return { ...state, sortBy: action.payload }
    case 'ADVANCE_STATUS':
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== action.payload) return order
          const nextStatus = { Nuevo: 'En barra', 'En barra': 'Listo', Listo: 'Listo' }[order.status]
          return { ...order, status: nextStatus }
        }),
      }
    default:
      return state
  }
}

export function useOrdersReducer() {
  const [state, dispatch] = useReducer(ordersReducer, {
    orders: initialOrders,
    filter: 'Todos',
    sortBy: 'recent',
  })
  return [state, dispatch]
}
