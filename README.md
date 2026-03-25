# I-LOVE-DELICITAS-FINAL-2.0

## 📁 Estrutura do Projeto

```
frontend/
  src/
    pages/
      home/index.html
      catalogo/index.html
      carrinho/index.html
      checkout/index.html
      pedido/index.html
      perfil/index.html
      login/index.html
      cadastro/index.html
    config/
      supabase.js
  __lixo/                  ← arquivos para revisão manual
    admin/dashboard.html
    recuperar-senha/index.html
```

---

## 📋 Relatório de Reorganização

### Arquivos .html encontrados (antes → depois)

| Caminho original | Novo caminho |
|---|---|
| `src/pages/home/index.html` | `frontend/src/pages/home/index.html` |
| `src/pages/home/src/pages/admin/src/pages/perfil/index.html` | `frontend/src/pages/perfil/index.html` |
| `src/pages/home/src/pages/admin/src/pages/perfil/src/pages/catalogo/index.html` | `frontend/src/pages/catalogo/index.html` |
| `src/pages/home/src/pages/admin/src/pages/perfil/src/pages/catalogo/src/pages/carrinho/index.html` | `frontend/src/pages/carrinho/index.html` |
| `src/pages/home/src/pages/admin/src/pages/perfil/src/pages/catalogo/src/pages/carrinho/src/pages/checkout/index.html` | `frontend/src/pages/checkout/index.html` |
| `src/pages/home/src/pages/admin/src/pages/perfil/src/pages/catalogo/src/pages/carrinho/src/pages/checkout/src/pages/pedido/index.html` | `frontend/src/pages/pedido/index.html` |
| `src/pages/home/src/pages/admin/src/pages/perfil/src/pages/catalogo/src/pages/carrinho/src/pages/checkout/src/pages/pedido/src/pages/login/index.html` | `frontend/src/pages/login/index.html` |
| `src/pages/home/src/pages/admin/src/pages/perfil/src/pages/catalogo/src/pages/carrinho/src/pages/checkout/src/pages/pedido/src/pages/login/src/pages/cadastro/index.html` | `frontend/src/pages/cadastro/index.html` |

### Outros arquivos movidos

| Caminho original | Novo caminho |
|---|---|
| `config.js` | `frontend/src/config/supabase.js` |

### Arquivos para revisão manual (`frontend/__lixo/`)

| Caminho original | Motivo |
|---|---|
| `src/pages/home/src/pages/admin/dashboard.html` | Página de admin não prevista na estrutura-alvo |
| `src/.../cadastro/src/pages/recuperar-senha/index.html` | Página recuperar-senha não prevista na estrutura-alvo |

### Pastas removidas

- `src/` — pasta raiz antiga com toda a estrutura duplicada/aninhada (ex: `src/pages/home/src/pages/admin/src/pages/...`)