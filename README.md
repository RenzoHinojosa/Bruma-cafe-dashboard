# Bruma Cafe - Dashboard de Operaciones

Dashboard para una cafetería de especialidad construido con React y Vite. La interfaz se centra en el flujo real de barra: crear comandas, moverlas por estados, filtrar, buscar y alternar el tema visual.

## Módulos funcionales

- **Operaciones:** permite crear, buscar, filtrar, ordenar, avanzar y eliminar pedidos.
- **Carta del día:** muestra cuatro productos con fotografías remotas de Unsplash. El botón **Agregar** añade el producto como una comanda real y abre Operaciones para gestionarla.
- **Equipo:** presenta el perfil de **Renzo Hinojosa** y permite marcar su estado de turno como disponible o fuera de turno.

## Inicio rápido

```bash
npm install
npm run dev
```

Después abre la dirección que muestra Vite (normalmente `http://localhost:5173`). Para comprobar calidad antes de entregar:

```bash
npm run lint
npm run build
```

## Estructura

```text
src/
├── components/OrderTable.jsx     # Tabla memorizada de pedidos
├── contexts/ThemeContext.jsx     # Tema global claro/oscuro
├── hooks/useLocalStorage.js      # Hook reutilizable para persistencia
├── hooks/useOrdersReducer.js     # Estado complejo y reducer de pedidos
├── App.jsx                       # Composición y UI local
└── styles.css                    # Sistema visual responsive
```

## Flujo de estado y ciclo de render

```text
Interacción de usuario
        │
        ├── filtro / orden / avanzar / eliminar / crear
        ▼
dispatch(action) ──► ordersReducer ──► nuevo estado inmutable
                                            │
                                            ▼
                                      render de App
                                            │
                 ┌──────────────────────────┴──────────────────────────┐
                 ▼                                                     ▼
       useMemo: visibleOrders / stats                       useEffect: indicador de sync
                 │                                                     │
                 ▼                                                     ▼
    OrderTable memoizado recibe solo datos                   cleanup cancela el timer previo
```

## Justificación de hooks

| Hook | Aplicación | Por qué no un `useState` simple |
|---|---|---|
| `useReducer` | Pedidos, filtro y orden | Hay varias transiciones relacionadas e inmutables: crear, eliminar, filtrar, ordenar y avanzar estado. El reducer concentra esa lógica y hace cada acción trazable. |
| `useState` | Modal de comanda y texto de búsqueda | Son controles locales, independientes y pequeños. |
| `useContext` | Preferencia de tema | Evita pasar `theme` y `toggleTheme` por props entre niveles. |
| `useEffect` | Tema en el documento, autofocus y simulación de sincronización | Coordina con DOM y timers externos al render. Cada efecto retorna cleanup: elimina el atributo de tema, quita foco o cancela el timeout. |
| `useMemo` | Pedidos visibles, ordenados y métricas | Evita recalcular filtros, orden y agregados si sus dependencias no cambian. |
| `useCallback` | Handlers pasados a `OrderTable` | Mantiene referencias estables para que `React.memo` pueda evitar renders de la tabla que no aportan cambios. |
| `useRef` | Input de cliente y timer | Accede al nodo para autofocus y guarda el identificador del timer sin provocar renders. |
| `useLocalStorage` | Tema | Encapsula lectura, escritura segura y serialización para reutilizarlo en otras preferencias. |

## Validación sugerida

1. Ejecuta `npm run lint`; la configuración incluye `react-hooks/recommended`, por lo que muestra dependencias incompletas de efectos y callbacks.
2. Crea un pedido y alterna filtros/orden. El estado se actualiza por acciones del reducer y el indicador de sincronización se reinicia correctamente.
3. Abre React DevTools > Profiler, graba una búsqueda o un cambio de tema y revisa los commits. `OrderTable` está envuelto en `React.memo`; sus callbacks son estables mediante `useCallback`.
4. Abre y cierra el modal de pedido: el input recibe autofocus por `useRef`. Cambia pedidos con rapidez y desmonta/navega: el cleanup del efecto cancela el timeout anterior.

## Tecnologías

- React 19 + Vite
- lucide-react para iconografía SVG accesible y consistente
- CSS propio: no se usa un kit visual genérico
