import { EmailCenterClient } from "@/components/admin/EmailCenterClient";
import { getEmailsAction, getEmailStatsAction, getCorporateAccountsAction } from "@/lib/actions/emails";
import { getAbandonedCartsAction } from "@/lib/actions/abandonedCart";
import {
  getNewsletterLeadsAction,
  getLeadCaptureConfigAction,
} from "@/lib/actions/leadCapture";
import { getAudienceCountsAction } from "@/lib/actions/marketing";
import { getCorporateEmailConfig } from "@/lib/email";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Centro de Correos & Webmail | Bonbon Flowers Admin",
  description: "Webmail corporativo estilo Gmail, recuperación de carritos abandonados, captador flotante y marketing masivo con Resend.",
};

export default async function AdminCorreosPage() {
  const [
    emailsRes,
    statsRes,
    cartsRes,
    leadsRes,
    audienceRes,
    leadConfigRes,
    corporateConfig,
    accountsRes,
  ] = await Promise.all([
    getEmailsAction({ folder: "inbox" }),
    getEmailStatsAction(),
    getAbandonedCartsAction({ page: 1, limit: 25 }),
    getNewsletterLeadsAction({ page: 1, limit: 50 }),
    getAudienceCountsAction(),
    getLeadCaptureConfigAction(),
    getCorporateEmailConfig(),
    getCorporateAccountsAction(),
  ]);

  return (
    <div className="space-y-6">
      <EmailCenterClient
        initialAccounts={accountsRes.accounts || []}
        initialEmails={emailsRes.success ? emailsRes.data || [] : []}
        initialTotal={emailsRes.success ? emailsRes.total || 0 : 0}
        initialUnread={statsRes.unreadInbox || 0}
        initialSentCount={statsRes.totalSent || 0}
        initialInboxCount={statsRes.totalInbox || 0}
        initialCarts={cartsRes.success ? cartsRes.data || [] : []}
        initialCartStats={cartsRes.stats || { activeCount: 0, activeValue: 0, recoveredCount: 0, recoveredValue: 0 }}
        initialLeads={leadsRes.success ? leadsRes.data || [] : []}
        initialAudience={audienceRes.data || { all_customers: 0, newsletter_leads: 0, abandoned_carts: 0, all_contacts: 0 }}
        initialSettings={{
          sender: {
            corporateSenderEmail: corporateConfig.senderEmail,
            corporateSenderName: corporateConfig.senderName,
            corporateReplyToEmail: corporateConfig.replyTo,
            resendApiKey: corporateConfig.resendApiKey,
            adminNotifyEmails: corporateConfig.adminEmails,
          },
          popup: leadConfigRes.data,
        }}
      />
    </div>
  );
}
