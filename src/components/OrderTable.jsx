import { memo } from 'react'
import { Check, ChevronRight, Trash2 } from 'lucide-react'

const statusClass = { Nuevo: 'new', 'En barra': 'brewing', Listo: 'ready' }

function OrderTable({ orders, onAdvance, onRemove }) {
  if (!orders.length) {
    return <div className="empty-state">No encontramos pedidos con este filtro.</div>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Detalle</th><th>Canal</th><th>Estado</th><th>Total</th><th aria-label="Acciones" /></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><span className="order-id">{order.id}</span><small>{order.time}</small></td>
              <td className="guest">{order.guest}</td>
              <td>{order.drink}</td>
              <td><span className="channel">{order.channel}</span></td>
              <td><span className={`status ${statusClass[order.status]}`}><i />{order.status}</span></td>
              <td className="price">S/ {order.total.toFixed(2)}</td>
              <td className="actions">
                {order.status !== 'Listo' && <button className="icon-button" onClick={() => onAdvance(order.id)} aria-label={`Avanzar ${order.id}`}><ChevronRight size={17} /></button>}
                {order.status === 'Listo' && <Check className="done" size={18} aria-label="Pedido listo" />}
                <button className="icon-button danger" onClick={() => onRemove(order.id)} aria-label={`Eliminar ${order.id}`}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default memo(OrderTable)
