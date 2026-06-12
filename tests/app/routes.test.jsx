import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const PAGES = [
  { name: 'Home', file: 'app/page.jsx' },
  { name: 'Layout', file: 'app/layout.jsx' },
  { name: 'Error', file: 'app/error.jsx' },
  { name: 'Login', file: 'app/login/page.jsx' },
  { name: 'Register', file: 'app/register/page.jsx' },
  { name: 'ForgotPassword', file: 'app/forgot-password/page.jsx' },
  { name: 'ResetPassword', file: 'app/reset-password/page.jsx' },
  { name: 'VerifyEmail', file: 'app/verify-email/page.jsx' },
  { name: 'AvisoLegal', file: 'app/aviso-legal/page.jsx' },
  { name: 'Terminos', file: 'app/terminos/page.jsx' },
  { name: 'Cookie', file: 'app/cookie/page.jsx' },
  { name: 'Settings', file: 'app/settings/page.jsx' },
  { name: 'Credits', file: 'app/credits/page.jsx' },
  { name: 'Reviews', file: 'app/reviews/page.jsx' },
  { name: 'Requested', file: 'app/requested/page.jsx' },
  { name: 'PublishProperty', file: 'app/publish-property/page.jsx' },
  { name: 'Dashboard', file: 'app/dashboard/page.jsx' },
  { name: 'DashboardAccount', file: 'app/dashboard/account/page.jsx' },
  { name: 'DashboardAgency', file: 'app/dashboard/agency/page.jsx' },
  { name: 'DashboardApplications', file: 'app/dashboard/applications/page.jsx' },
  { name: 'DashboardContactRequests', file: 'app/dashboard/contact-requests/page.jsx' },
  { name: 'DashboardCRM', file: 'app/dashboard/crm/page.jsx' },
  { name: 'DashboardMyOffers', file: 'app/dashboard/my-offers/page.jsx' },
  { name: 'DashboardMyProperties', file: 'app/dashboard/my-properties/page.jsx' },
  { name: 'DashboardNotifications', file: 'app/dashboard/notifications/page.jsx' },
  { name: 'DashboardOffers', file: 'app/dashboard/offers/page.jsx' },
  { name: 'DashboardRentalApplications', file: 'app/dashboard/rental-applications/page.jsx' },
  { name: 'DashboardShared', file: 'app/dashboard/shared/page.jsx' },
  { name: 'AdminApprovals', file: 'app/admin/approvals/page.jsx' },
  { name: 'AdminAgencies', file: 'app/admin/agencies/page.jsx' },
  { name: 'AdminAnalytics', file: 'app/admin/analytics/page.jsx' },
  { name: 'AdminAnalyticsMarket', file: 'app/admin/analytics/market/page.jsx' },
  { name: 'AdminProperties', file: 'app/admin/properties/page.jsx' },
  { name: 'AdminCarousel', file: 'app/admin/carousel/page.jsx' },
  { name: 'AdminDebug', file: 'app/admin/debug/page.jsx' },
  { name: 'AdminMaps', file: 'app/admin/maps/page.jsx' },
  { name: 'UploadSale', file: 'app/upload/sale/page.jsx' },
  { name: 'UploadRental', file: 'app/upload/rental/page.jsx' },
  { name: 'PropertiesPage', file: 'app/properties/page.jsx' },
  { name: 'PropertyDetail', file: 'app/properties/[id]/page.jsx' },
  { name: 'PropertyEdit', file: 'app/properties/[id]/edit/page.jsx' },
  { name: 'PropertyMap', file: 'app/properties/map/page.jsx' },
  { name: 'PropertyMapDraw', file: 'app/properties/map/draw/page.jsx' },
  { name: 'PropertyImport', file: 'app/properties/import/page.jsx' },
  { name: 'AdminDebugSession', file: 'app/admin/debug/[sessionId]/page.jsx' },
];

describe('Route Existence', () => {
  for (const { name, file } of PAGES) {
    it(`${name} page file exists`, () => {
      expect(existsSync(path.resolve(PROJECT_ROOT, file))).toBe(true);
    });
  }
});
