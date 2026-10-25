import { useNavigate } from "react-router-dom"
import { Btn } from "@/components/common/Btn"
import { ROUTES } from "@/constants/routes"

export function NotFoundScreen() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[70vh] gap-4 p-8 text-center">
      <div className="text-6xl font-black text-primary">۴۰۴</div>
      <h1 className="text-xl font-bold text-foreground">
        صفحه مورد نظر یافت نشد
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        نشانی وارد شده معتبر نیست یا صفحه مورد نظر جابه‌جا شده است.
      </p>
      <Btn variant="primary" onClick={() => navigate(ROUTES.dashboard)}>
        بازگشت به داشبورد
      </Btn>
    </div>
  )
}
