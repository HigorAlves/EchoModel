# EchoModel Features

Features documentation for Jira stories with subtasks.

**Status Legend:**
- ![Implemented](https://img.shields.io/badge/status-Implemented-green) - Feature is complete
- ![In Progress](https://img.shields.io/badge/status-In%20Progress-yellow) - Feature is being developed
- ![Planned](https://img.shields.io/badge/status-Planned-blue) - Feature is planned for future

---

## Story 1: User Management ![Implemented](https://img.shields.io/badge/status-Implemented-green)

**Description:**
Implement user management system with CRUD operations and Firebase Authentication integration.

**Subtasks:**
- [x] Create User entity with aggregate root pattern
- [x] Implement CreateUserCommand with validation
- [x] Implement UpdateUserCommand for profile updates
- [x] Implement DeleteUserCommand with soft delete
- [x] Implement GetUserByIdQuery
- [x] Implement ListUsersQuery with pagination
- [x] Create User Cloud Function endpoints
- [x] Add Firebase Auth middleware
- [x] Integrate Firebase Authentication (email/password, Google)
- [x] Add user profile value objects (FullName, Locale)
- [x] Create user repository interface and Firestore implementation
- [x] Add E2E tests for user endpoints

**Acceptance Criteria:**
- Users can register with email/password
- Users can authenticate via Google SSO
- Users can update their profile information
- Admin users can list and manage all users
- User data is properly validated before persistence

---

## Story 2: Store Management ![Implemented](https://img.shields.io/badge/status-Implemented-green)

**Description:**
Implement multi-tenant store management allowing users to create and manage stores with custom settings and branding.

**Subtasks:**
- [x] Create Store entity with aggregate root pattern
- [x] Implement store ownership and permissions
- [x] Create store settings value object
- [x] Implement CreateStoreCommand
- [x] Implement UpdateStoreCommand
- [x] Implement GetStoreByIdQuery
- [x] Implement ListStoresQuery for user's stores
- [x] Add store repository interface and implementation
- [x] Create store-user relationship handling
- [x] Add store branding configuration

**Acceptance Criteria:**
- Users can create multiple stores
- Store owners can update store settings
- Store settings include branding options
- Users can only access their own stores
- Store data is isolated between tenants

---

## Story 3: Model Creation ![Implemented](https://img.shields.io/badge/status-Implemented-green)

**Description:**
Enable users to create AI influencer models with detailed demographics, appearance settings, and fashion configuration.

**Subtasks:**
- [x] Create Model entity with aggregate root pattern
- [x] Implement demographics value objects (age, ethnicity, body type)
- [x] Implement appearance configuration (hair, eyes, skin tone)
- [x] Implement fashion style preferences
- [x] Create CreateModelCommand with full configuration
- [x] Implement model validation rules
- [x] Add model status state machine (Draft, Calibrating, Active)
- [x] Create model repository interface and implementation
- [x] Link models to stores
- [x] Add model listing and filtering

**Acceptance Criteria:**
- Users can create models with demographic details
- Appearance settings are fully configurable
- Fashion preferences are saved with the model
- Models are associated with a specific store
- Model status transitions are enforced

---

## Story 4: Model Calibration ![In Progress](https://img.shields.io/badge/status-In%20Progress-yellow)

**Description:**
Implement the calibration workflow for AI models including starting calibration, reviewing results, and approval/rejection flow.

**Subtasks:**
- [x] Define calibration status enum (Pending, Processing, Completed, Failed)
- [x] Implement StartCalibrationCommand
- [x] Create calibration job entity
- [ ] Integrate with AI calibration service
- [ ] Implement calibration progress tracking
- [ ] Create ApproveCalibrationCommand
- [ ] Create RejectCalibrationCommand with feedback
- [ ] Add calibration result storage
- [ ] Implement calibration retry logic
- [ ] Add calibration webhooks for status updates

**Acceptance Criteria:**
- Users can start calibration for a model
- Calibration progress is visible in real-time
- Users can approve or reject calibration results
- Rejected calibrations can be retried with adjustments
- Calibration history is maintained

---

## Story 5: Image Generation ![In Progress](https://img.shields.io/badge/status-In%20Progress-yellow)

**Description:**
Implement AI image generation using Seedream 4.5 service to create influencer content based on model configuration.

**Subtasks:**
- [x] Create Generation entity with aggregate root pattern
- [x] Implement generation request value objects
- [x] Create Seedream 4.5 service integration
- [x] Implement CreateGenerationCommand
- [ ] Add generation queue management
- [ ] Implement generation progress tracking
- [ ] Create GetGenerationByIdQuery
- [ ] Implement ListGenerationsQuery with filters
- [ ] Add generation result storage to cloud
- [ ] Implement generation retry on failure
- [ ] Add generation cost tracking

**Acceptance Criteria:**
- Users can request image generation for calibrated models
- Generation requests are queued and processed
- Progress is visible during generation
- Generated images are stored and accessible
- Generation history is searchable

---

## Story 6: Asset Management ![Implemented](https://img.shields.io/badge/status-Implemented-green)

**Description:**
Implement asset management system for file uploads, cloud storage with signed URLs, and asset categorization.

**Subtasks:**
- [x] Create Asset entity with metadata
- [x] Implement file upload handler
- [x] Configure Firebase Storage integration
- [x] Implement signed URL generation
- [x] Create asset categories (images, documents, generated)
- [x] Implement CreateAssetCommand
- [x] Implement GetAssetByIdQuery
- [x] Implement ListAssetsQuery with category filter
- [x] Add asset thumbnail generation
- [x] Implement asset deletion with cleanup

**Acceptance Criteria:**
- Users can upload files through the API
- Files are stored securely in cloud storage
- Signed URLs provide temporary access
- Assets are organized by categories
- Asset metadata is searchable

---

## Story 7: Dashboard Overview ![In Progress](https://img.shields.io/badge/status-In%20Progress-yellow)

**Description:**
Create the main dashboard page with statistics cards, quick action buttons, and recent activity feed.

**Subtasks:**
- [x] Create dashboard page layout
- [x] Implement stats cards component (models, generations, assets)
- [x] Create quick actions section
- [ ] Implement recent activity feed
- [ ] Add real-time stats updates
- [ ] Create dashboard skeleton loading state
- [ ] Add responsive layout for mobile
- [ ] Implement dashboard data fetching hooks

**Acceptance Criteria:**
- Dashboard displays key metrics at a glance
- Quick actions provide shortcuts to common tasks
- Activity feed shows recent user actions
- Dashboard loads quickly with skeleton states
- Layout adapts to different screen sizes

---

## Story 8: Create Model Wizard ![Implemented](https://img.shields.io/badge/status-Implemented-green)

**Description:**
Implement a 5-step wizard for creating AI models: basic info, appearance, fashion preferences, reference images, and review.

**Subtasks:**
- [x] Create wizard container with step navigation
- [x] Implement Step 1: Basic Information form
- [x] Implement Step 2: Appearance configuration
- [x] Implement Step 3: Fashion style preferences
- [x] Implement Step 4: Reference images upload
- [x] Implement Step 5: Review and confirmation
- [x] Add form validation per step
- [x] Implement wizard state persistence
- [x] Create progress indicator component
- [x] Add wizard completion handler

**Acceptance Criteria:**
- Users can navigate between wizard steps
- Form data persists across steps
- Validation prevents advancing with invalid data
- Review step shows all entered information
- Wizard can be cancelled or completed

---

## Story 9: Models Listing ![In Progress](https://img.shields.io/badge/status-In%20Progress-yellow)

**Description:**
Create the models listing page with search, filters, grid view, and model cards showing key information.

**Subtasks:**
- [x] Create models listing page layout
- [x] Implement model card component
- [x] Add search functionality
- [ ] Implement filter by status
- [ ] Implement filter by creation date
- [ ] Add grid/list view toggle
- [ ] Create empty state component
- [ ] Implement pagination or infinite scroll
- [ ] Add model quick actions (edit, delete, generate)

**Acceptance Criteria:**
- Users can view all their models in a grid
- Search finds models by name
- Filters narrow down the model list
- Model cards show key information and status
- Quick actions are accessible from cards

---

## Story 10: Generations Listing ![Planned](https://img.shields.io/badge/status-Planned-blue)

**Description:**
Create the generations listing page with search, filters, and generation cards showing status and preview.

**Subtasks:**
- [ ] Create generations listing page layout
- [ ] Implement generation card component
- [ ] Add generation status indicators
- [ ] Implement search by model name
- [ ] Implement filter by status
- [ ] Implement filter by date range
- [ ] Add generation preview modal
- [ ] Implement bulk selection and actions
- [ ] Create generation detail view

**Acceptance Criteria:**
- Users can view all generations in a list
- Status indicators show generation progress
- Search and filters help find specific generations
- Preview shows generated images
- Bulk actions allow managing multiple items

---

## Story 11: Assets Library ![Planned](https://img.shields.io/badge/status-Planned-blue)

**Description:**
Create the assets library with drag-and-drop upload zone, category filtering, and asset cards with actions.

**Subtasks:**
- [ ] Create assets library page layout
- [ ] Implement drag-and-drop upload zone
- [ ] Create asset card component
- [ ] Add category tabs/filter
- [ ] Implement asset preview modal
- [ ] Add asset download functionality
- [ ] Implement asset deletion with confirmation
- [ ] Add bulk upload support
- [ ] Create upload progress indicators

**Acceptance Criteria:**
- Users can upload files via drag-and-drop
- Assets are organized by categories
- Preview modal shows full-size assets
- Download provides original file
- Upload progress is clearly visible

---

## Story 12: Accounts Management ![Planned](https://img.shields.io/badge/status-Planned-blue)

**Description:**
Implement accounts management for payment methods including bank accounts, credit cards, and digital wallets.

**Subtasks:**
- [ ] Create accounts page layout
- [ ] Implement bank account form
- [ ] Implement credit card form with validation
- [ ] Implement wallet connection
- [ ] Create account card component
- [ ] Add account verification flow
- [ ] Implement default payment method selection
- [ ] Add account deletion with confirmation
- [ ] Integrate with payment processor

**Acceptance Criteria:**
- Users can add bank accounts
- Credit cards are validated on entry
- Digital wallets can be connected
- Default payment method is selectable
- Account data is securely stored

---

## Story 13: Settings ![Planned](https://img.shields.io/badge/status-Planned-blue)

**Description:**
Create the settings pages for store configuration, branding, billing management, and team member administration.

**Subtasks:**
- [ ] Create settings page layout with navigation
- [ ] Implement store settings tab
- [ ] Implement branding settings with logo upload
- [ ] Implement billing settings tab
- [ ] Implement team management tab
- [ ] Add team member invitation flow
- [ ] Create role management UI
- [ ] Implement settings save with validation
- [ ] Add settings change confirmation

**Acceptance Criteria:**
- Store settings can be updated
- Branding includes logo and color customization
- Billing shows current plan and usage
- Team members can be invited and managed
- Changes are saved with confirmation

---

## Story 14: Authentication Pages ![Implemented](https://img.shields.io/badge/status-Implemented-green)

**Description:**
Create authentication pages including login and signup forms with email/password and Google SSO options using Firebase Auth.

**Subtasks:**
- [x] Create login page layout
- [x] Implement email/password login form
- [x] Add Google SSO login button
- [x] Create signup page layout
- [x] Implement signup form with validation
- [x] Add password strength indicator
- [x] Implement form error handling
- [x] Create forgot password flow
- [x] Add remember me functionality

**Acceptance Criteria:**
- Users can log in with email/password
- Google SSO is available and functional
- Signup validates all required fields
- Password requirements are clearly shown
- Error messages are user-friendly
