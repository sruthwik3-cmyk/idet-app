// Smart Renewal Assistant - Jarvis suggests renewal links for expiring documents

export interface RenewalLink {
    name: string;
    url: string;
    description: string;
    category: string;
}

// Database of common document renewal links
const RENEWAL_LINKS: Record<string, RenewalLink[]> = {
    // Personal Documents
    'passport': [
        {
            name: 'Indian Passport Renewal',
            url: 'https://portal2.passportindia.gov.in/AppOnlineProject/online/procFormSubOnline',
            description: 'Official Indian Passport Seva Portal',
            category: 'Personal'
        },
        {
            name: 'US Passport Renewal',
            url: 'https://travel.state.gov/content/travel/en/passports/have-passport/renew.html',
            description: 'US Department of State - Passport Renewal',
            category: 'Personal'
        }
    ],
    'driving license': [
        {
            name: 'Indian Driving License Renewal',
            url: 'https://parivahan.gov.in/parivahan/',
            description: 'Parivahan Sewa - DL Renewal',
            category: 'Personal'
        }
    ],
    'aadhar': [
        {
            name: 'Aadhaar Update',
            url: 'https://uidai.gov.in/en/my-aadhaar/update-your-aadhaar.html',
            description: 'UIDAI - Update Aadhaar Details',
            category: 'Personal'
        }
    ],
    'pan card': [
        {
            name: 'PAN Card Services',
            url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
            description: 'NSDL - PAN Card Application',
            category: 'Financial'
        }
    ],

    // Insurance
    'insurance': [
        {
            name: 'Health Insurance Renewal',
            url: 'https://www.policybazaar.com/health-insurance/',
            description: 'Compare and renew health insurance',
            category: 'Financial'
        },
        {
            name: 'Car Insurance Renewal',
            url: 'https://www.policybazaar.com/motor-insurance/',
            description: 'Compare and renew car insurance',
            category: 'Vehicle'
        }
    ],

    // Vehicle Documents
    'vehicle registration': [
        {
            name: 'Vehicle RC Renewal',
            url: 'https://parivahan.gov.in/parivahan/',
            description: 'Parivahan Sewa - RC Renewal',
            category: 'Vehicle'
        }
    ],
    'pollution certificate': [
        {
            name: 'PUC Certificate',
            url: 'https://parivahan.gov.in/parivahan/',
            description: 'Get Pollution Under Control Certificate',
            category: 'Vehicle'
        }
    ],

    // Medical
    'medical certificate': [
        {
            name: 'Book Medical Checkup',
            url: 'https://www.practo.com/',
            description: 'Book appointment for medical certificate',
            category: 'Medical'
        }
    ],

    // Education
    'student id': [
        {
            name: 'University Portal',
            url: '#',
            description: 'Contact your university for ID renewal',
            category: 'Education'
        }
    ],

    // Legal
    'lease agreement': [
        {
            name: 'Rent Agreement Services',
            url: 'https://www.legaldesk.com/rent-agreement',
            description: 'Create new rent agreement online',
            category: 'Legal'
        }
    ]
};

// Find renewal links for a document
export function findRenewalLinks(documentName: string, category: string): RenewalLink[] {
    const searchTerm = documentName.toLowerCase();
    const results: RenewalLink[] = [];

    // Search in renewal links database
    for (const [key, links] of Object.entries(RENEWAL_LINKS)) {
        if (searchTerm.includes(key) || key.includes(searchTerm)) {
            results.push(...links.filter(link => 
                link.category === category || category === 'Personal'
            ));
        }
    }

    // If no specific links found, provide generic renewal suggestions
    if (results.length === 0) {
        results.push({
            name: `Search for ${documentName} Renewal`,
            url: `https://www.google.com/search?q=${encodeURIComponent(documentName + ' renewal online')}`,
            description: 'Search Google for renewal information',
            category
        });
    }

    return results;
}

// Generate Jarvis speech for renewal suggestion
export function generateRenewalSpeech(
    documentName: string,
    daysLeft: number,
    renewalLinks: RenewalLink[]
): string {
    const urgency = daysLeft <= 7 ? 'urgent' : 'soon';
    const greeting = daysLeft <= 7 
        ? `Alert! Your ${documentName} is expiring very soon, in just ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`
        : `Reminder: Your ${documentName} will expire in ${daysLeft} days.`;

    if (renewalLinks.length === 0) {
        return `${greeting} I recommend starting the renewal process soon.`;
    }

    const mainLink = renewalLinks[0];
    let speech = `${greeting} I can help you with the renewal. `;

    if (renewalLinks.length === 1) {
        speech += `I found the ${mainLink.name} portal for you. Would you like me to open it?`;
    } else {
        speech += `I found ${renewalLinks.length} renewal options for you. The recommended one is ${mainLink.name}. Would you like me to open it?`;
    }

    return speech;
}

// Check if document needs renewal reminder
export function needsRenewalReminder(expiryDate: string): {
    needs: boolean;
    daysLeft: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
} {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const expiryUTC = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const daysLeft = Math.floor((expiryUTC - todayUTC) / (1000 * 60 * 60 * 24));

    let urgency: 'critical' | 'high' | 'medium' | 'low' = 'low';
    let needs = false;

    if (daysLeft <= 0) {
        urgency = 'critical';
        needs = true;
    } else if (daysLeft <= 7) {
        urgency = 'critical';
        needs = true;
    } else if (daysLeft <= 30) {
        urgency = 'high';
        needs = true;
    } else if (daysLeft <= 60) {
        urgency = 'medium';
        needs = true;
    }

    return { needs, daysLeft, urgency };
}

// Get all documents that need renewal reminders
export function getDocumentsNeedingRenewal(documents: any[]): Array<{
    document: any;
    daysLeft: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    renewalLinks: RenewalLink[];
    speech: string;
}> {
    const results: any[] = [];

    for (const doc of documents) {
        const { needs, daysLeft, urgency } = needsRenewalReminder(doc.expiryDate);

        if (needs) {
            const renewalLinks = findRenewalLinks(doc.name, doc.category);
            const speech = generateRenewalSpeech(doc.name, daysLeft, renewalLinks);

            results.push({
                document: doc,
                daysLeft,
                urgency,
                renewalLinks,
                speech
            });
        }
    }

    // Sort by urgency (critical first)
    results.sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    return results;
}

// Open renewal link
export function openRenewalLink(link: RenewalLink): void {
    window.open(link.url, '_blank', 'noopener,noreferrer');
}

// Generate renewal reminder card data
export function generateRenewalCard(
    documentName: string,
    daysLeft: number,
    category: string,
    renewalLinks: RenewalLink[]
) {
    return {
        title: `${documentName} Renewal`,
        daysLeft,
        category,
        urgency: daysLeft <= 7 ? 'critical' : daysLeft <= 30 ? 'high' : 'medium',
        message: daysLeft <= 7 
            ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}! Renew immediately.`
            : `Expires in ${daysLeft} days. Start renewal process.`,
        links: renewalLinks,
        icon: daysLeft <= 7 ? '🚨' : '⏰'
    };
}
