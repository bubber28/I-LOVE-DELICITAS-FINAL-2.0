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
      recuperar-senha/index.html
    config/
      supabase.js
```

> **Admin:** os arquivos de administração (`dashboard.html` e demais páginas do painel) pertencem ao repositório separado [I-LOVE-DELICITAS-FINAL-2.0-BAKEND](https://github.com/bubber28/I-LOVE-DELICITAS-FINAL-2.0-BAKEND).

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
| `src/.../cadastro/src/pages/recuperar-senha/index.html` | `frontend/src/pages/recuperar-senha/index.html` |

### Outros arquivos movidos

| Caminho original | Novo caminho |
|---|---|
| `config.js` | `frontend/src/config/supabase.js` |

### Arquivos para revisão manual (`frontend/__lixo/`)

> Nenhum arquivo restou em `__lixo`. A pasta foi removida.
>
> - `admin/dashboard.html` → **removido do frontend** (pertence ao repositório admin separado)
> - `recuperar-senha/index.html` → promovido para `frontend/src/pages/recuperar-senha/index.html`

### Pastas removidas

- `src/` — pasta raiz antiga com toda a estrutura duplicada/aninhada
- `frontend/__lixo/` — pasta temporária de revisão (esvaziada e removida)