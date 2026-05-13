const ALLOWED_TRANSITIONS = {
  submitted: ["in-review", "cancelled"],
  "in-review": ["approved", "rejected", "cancelled"],
  approved: [],
  rejected: [],
  cancelled: [],
};

const seedApplications = [
  {
    id: "app_demo_1001",
    status: "submitted",
    productType: "checking",
    initialDepositAmount: 250,
    riskScore: 38,
    requiredDocuments: ["government-id", "proof-of-address"],
    customer: {
      firstName: "Jordan",
      lastName: "Ellis",
      dateOfBirth: "1991-08-14",
      email: "jordan.ellis@example.com",
      phone: "+1-555-0101",
      taxIdLast4: "3141",
      address: {
        line1: "1200 Walnut Avenue",
        line2: "Apt 4B",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
        country: "US",
      },
    },
    consent: {
      acceptedTerms: true,
      marketingOptIn: true,
    },
    decisionSummary: "Application submitted for identity verification.",
    createdAt: "2026-05-01T14:00:00.000Z",
    updatedAt: "2026-05-01T14:00:00.000Z",
  },
  {
    id: "app_demo_1002",
    status: "in-review",
    productType: "savings",
    initialDepositAmount: 500,
    riskScore: 21,
    requiredDocuments: ["government-id"],
    customer: {
      firstName: "Avery",
      lastName: "Chen",
      dateOfBirth: "1985-11-03",
      email: "avery.chen@example.com",
      phone: "+1-555-0102",
      taxIdLast4: "2718",
      address: {
        line1: "88 Lakeview Drive",
        line2: "Unit 12",
        city: "Portland",
        state: "OR",
        postalCode: "97205",
        country: "US",
      },
    },
    consent: {
      acceptedTerms: true,
      marketingOptIn: false,
    },
    decisionSummary: "Application is being reviewed by digital onboarding operations.",
    createdAt: "2026-05-02T15:15:00.000Z",
    updatedAt: "2026-05-03T09:20:00.000Z",
  },
  {
    id: "app_demo_1003",
    status: "approved",
    productType: "credit-card",
    initialDepositAmount: 0,
    riskScore: 17,
    requiredDocuments: ["government-id", "income-verification"],
    customer: {
      firstName: "Samira",
      lastName: "Patel",
      dateOfBirth: "1978-02-21",
      email: "samira.patel@example.com",
      phone: "+1-555-0103",
      taxIdLast4: "1618",
      address: {
        line1: "9 Harbor Point",
        line2: "Floor 3",
        city: "Boston",
        state: "MA",
        postalCode: "02110",
        country: "US",
      },
    },
    consent: {
      acceptedTerms: true,
      marketingOptIn: true,
    },
    decisionSummary: "Application approved after automated identity and credit review.",
    createdAt: "2026-05-04T18:45:00.000Z",
    updatedAt: "2026-05-05T11:05:00.000Z",
  },
];

let applications = seedApplications.map((application) => structuredClone(application));
let nextApplicationNumber = 2001;

function computeRiskScore(payload) {
  const last4 = Number(payload.customer.taxIdLast4);
  const productWeight = {
    checking: 7,
    savings: 4,
    "credit-card": 13,
  }[payload.productType];
  const depositWeight = payload.initialDepositAmount >= 500 ? -5 : 6;
  return Math.max(0, Math.min(100, (last4 % 53) + productWeight + depositWeight));
}

function requiredDocumentsFor(productType, riskScore) {
  const documents = ["government-id"];

  if (productType === "checking" || riskScore >= 35) {
    documents.push("proof-of-address");
  }

  if (productType === "credit-card") {
    documents.push("income-verification");
  }

  return documents;
}

function listApplications(filters) {
  const filteredApplications = applications.filter((application) => {
    if (filters.status && application.status !== filters.status) {
      return false;
    }

    if (filters.productType && application.productType !== filters.productType) {
      return false;
    }

    return true;
  });

  return {
    applications: filteredApplications.slice(filters.offset, filters.offset + filters.limit),
    total: filteredApplications.length,
  };
}

function getApplication(applicationId) {
  return applications.find((application) => application.id === applicationId);
}

function createApplication(payload) {
  const now = new Date().toISOString();
  const riskScore = computeRiskScore(payload);
  const application = {
    id: `app_demo_${nextApplicationNumber++}`,
    status: "submitted",
    productType: payload.productType,
    initialDepositAmount: payload.initialDepositAmount,
    riskScore,
    requiredDocuments: requiredDocumentsFor(payload.productType, riskScore),
    customer: structuredClone(payload.customer),
    consent: structuredClone(payload.consent),
    decisionSummary: "Application submitted for identity verification.",
    createdAt: now,
    updatedAt: now,
  };

  if (application.customer.address.line2 === undefined) {
    application.customer.address.line2 = "";
  }

  applications.push(application);
  return application;
}

function canTransition(fromStatus, toStatus) {
  return ALLOWED_TRANSITIONS[fromStatus].includes(toStatus);
}

function updateApplicationStatus(applicationId, status, reason) {
  const application = getApplication(applicationId);

  if (!application) {
    return { application: null, transitionAllowed: false };
  }

  if (!canTransition(application.status, status)) {
    return { application, transitionAllowed: false };
  }

  application.status = status;
  application.decisionSummary = reason || `Application status updated to ${status}.`;
  application.updatedAt = new Date().toISOString();

  return { application, transitionAllowed: true };
}

function deleteApplication(applicationId) {
  const applicationIndex = applications.findIndex((application) => application.id === applicationId);

  if (applicationIndex === -1) {
    return null;
  }

  const [deletedApplication] = applications.splice(applicationIndex, 1);
  deletedApplication.status = "cancelled";
  deletedApplication.updatedAt = new Date().toISOString();

  return {
    id: deletedApplication.id,
    deleted: true,
    status: deletedApplication.status,
  };
}

module.exports = {
  canTransition,
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplicationStatus,
};
