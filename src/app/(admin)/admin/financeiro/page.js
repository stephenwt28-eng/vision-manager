import AdminFinanceiroComponents from "./components";

export const metadata = {
  title: "Financeiro | Vision Manager",
  description:
    "Módulo financeiro administrativo com receitas, despesas, extrato, livro caixa, DRE, categorias e exportação para Excel.",
};

export default function AdminFinanceiroPage() {
  return <AdminFinanceiroComponents />;
}