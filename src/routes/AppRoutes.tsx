import { Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { ROUTES } from "@/constants/routes"
import { DashboardScreen } from "@/pages/Dashboard/DashboardScreen"
import { CampaignsScreen } from "@/pages/Campaigns/CampaignsScreen"
import { CreateCampaignScreen } from "@/pages/CreateCampaign/CreateCampaignScreen"
import { CampaignDetailScreen } from "@/pages/CampaignDetails/CampaignDetailScreen"
import { ParticipantsScreen } from "@/pages/Participants/ParticipantsScreen"
import { WinnersScreen } from "@/pages/Winners/WinnersScreen"
import { LotteryOperatorScreen } from "@/pages/Lottery/LotteryOperatorScreen"
import { LiveBroadcastScreen } from "@/pages/Broadcast/LiveBroadcastScreen"
import { BroadcastPreviewScreen } from "@/pages/Broadcast/BroadcastPreviewScreen"
import { NotFoundScreen } from "@/pages/NotFound/NotFoundScreen"

/**
 * All routes. Two groups:
 *
 * 1. Screens under <AppLayout> (persistent sidebar) — everything an admin
 *    browses day-to-day.
 * 2. Full-bleed screens rendered with NO sidebar — Lottery Operator and both
 *    Broadcast screens. Lottery Operator was moved out of the sidebar layout
 *    deliberately: its own root element is `h-screen`, which — nested inside
 *    the sidebar layout's own `h-screen` main content area — produced a
 *    double viewport-height container (see ENGINEERING REPORT, responsive
 *    fixes). Broadcast screens were already full-bleed in the original
 *    design; this just makes Lottery Operator consistent with that same
 *    "operator/immersive mode" treatment.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.campaignLottery}
        element={<LotteryOperatorScreen />}
      />
      <Route
        path={ROUTES.campaignBroadcast}
        element={<LiveBroadcastScreen />}
      />
      <Route
        path={ROUTES.campaignBroadcastPreview}
        element={<BroadcastPreviewScreen />}
      />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path={ROUTES.dashboard} element={<DashboardScreen />} />
        <Route path={ROUTES.campaigns} element={<CampaignsScreen />} />
        <Route
          path={ROUTES.createCampaign}
          element={<CreateCampaignScreen />}
        />
        <Route
          path={ROUTES.campaignDetail}
          element={<CampaignDetailScreen />}
        />
        <Route
          path={ROUTES.campaignParticipants}
          element={<ParticipantsScreen />}
        />
        <Route path={ROUTES.campaignWinners} element={<WinnersScreen />} />
        <Route path={ROUTES.participants} element={<ParticipantsScreen />} />
        <Route path={ROUTES.winners} element={<WinnersScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  )
}
