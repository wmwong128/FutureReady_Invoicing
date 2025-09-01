# AutoInvoice

## 👥 Team Members

- WONG WAI MAN STEFFI
- CHEAH SEONG TENG
- LEE ZHENG YU
- ERIC CHAN YAN LI
- RICHIE KHO HUI HUAN

## 📌 Problem and Solution Summary
### Pain Point
The root cause is **ineffective manual invoicing**, which creates snowball effect on payment delays and unclear financial statistics, making decision-making harder.
- Delayed cash flow -> Clients delay payments due to manual processes like follow-up.
- Vague financial oversight -> Without dashboard, financial data are often based on guesswork.
- Inefficient manual processes -> Employees spend hours chasing payments, updating spreadsheets, and sending follow-up emails instead of focusing on growth. 

### Solution 
By following stages in the Cash Inflow Process, we built an **automated, easily-integrated invoice tracking and management system** that:
| Stage              | Feature                                             | Business Impact |
|--------------------|-----------------------------------------------------|-----------------|
| **1. Credit Approval** | Client creditworthiness checks using predefined thresholds | Reduce credit risk by preventing unreliable clients from receiving invoices |
| **2. Invoice Creation** | Semi-automate invoicing generation | Accelerate billing cycles and minimize manual workload |
| **3. Invoice Sending** | Auto invoice emailing to clients | Ensure timely delivery and speed up billing cycles |
| **4. Client Follow-Up** | Automated email follow-up reminders | Save time chasing payments and improve collection rates |
| **5. Payment Processing** | Digital payment portal (Stripe) embedded in PDF invoices | Simplify transactions and encourage faster payments |
| **6. Financial Recording** | Financial dashboards with predictive models & AI chatbot | Provide clear financial oversight and enable data-driven decision-making |

⚠️ Note: Cash outflow (supplier payments) is not included due to security, complexity and low added value.

## 🛠️ Technology Stack Used
It is a monorepo based on the [Docker-oriented Cluster Template](https://github.com/RechieKho/docker_oriented_cluster_template) for the invoicing system made for Future Ready Competition.
- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **AI/ML Tools:** Ollama
- **Other Tools/Services:** ResendAPI, StripeAPI
- **DevOps & Deployment:** Docker

## ⚙️ Setup Instructions

Install the dependencies:

- [docker](https://docs.docker.com/desktop/)
- [nodejs](https://nodejs.org/en)

Clone the repository.

```sh
git clone https://github.com/wmwong128/FutureReady_Invoicing.git
```

You'll find all the code for each services in the `services/` directory,
which includes:

- frontend (`services/frontend`)
- backend (`services/backend`)
- ai (`services/ai`)

Then, install all the required API keys for the third-party services by adding it through `.env` or `.env.local` file.
The differences between `.env` and `.env.local` is that `.env` file is commited into the git repository while `.env.local` is excluded from the repository.
In your case, `.env.local` is encouraged while either case works.

Pertaining to the frontend's API keys, please refer the following table.
| key | description |
| ----- | ----- |
| `VITE_AUTH0_DOMAIN` | The domain of Auth0. |
| `VITE_AUTH0_CLIENT_ID` | The client ID of the single app application of Auth0. |
| `VITE_AUTH0_API_CLIENT_ID` | The client ID of the M2M application of Auth0. |
| `VITE_AUTH0_API_CLIENT_SECRET` | The client secret of the M2M application of Auth0. |
| `VITE_AUTH0_API_AUDIENCE` | The audience of the M2M application of Auth0. |
| `VITE_BACKEND_MAIN_URL` | The url to the backend service. |
| `VITE_AI_MAIN_URL` | The url to the ai service. |

Pertaining to the backend's API keys, please refer the following table.
| key | description |
| ----- | ----- |
| `AUTH0_AUDIENCE` | The audience of the M2M application of Auth0. |
| `AUTH0_ISSUER_BASE_URL` | The domain of Auth0. |
| `RESEND_API_KEY` | The API key for Resend service. |
| `FRONTEND_MAIN_URL` | The frontend url. |
| `MONGODB_URL` | The url to the mongodb. |
| `STRIPE_SECRET_KEY` | The secret key for stripe API. |
| `STRIPE_WEBHOOK_SECRET` | The secret key for stripe webhook |

Pertaining to the ai's API keys, please refer the follow table.
| key | description |
| ----- | ----- |
| `AUTH0_DOMAIN` | The domain of Auth0. |
| `AUTH0_AUDIENCE` | The audience of the M2M application of Auth0. |
| `FRONTEND_MAIN_URL` | The frontend url. |
| `MONGO_URI` | The url to the mongodb. |
| `OLLAMA_HOST` | The url to ollama |

After setting up the environment variable, then you need to install the dependencies.

```sh
npm install # At root directory.
cd services/frontend && npm install # install frontend dependencies.
cd ../../services/backend && npm install # install backend dependencies.
cd ../../services/ai && npm install # install ai dependencies.
```

Then, you can build and start the docker through the readily avaiable npm scripts.

```sh
npm run serve # At root directory.
```

This will take a while for the first time, approximately ~30 minutes. After the first build, the following build will be faster since docker cache the builds.

## 💡 Reflection
### Challenges
- Time constraints:
We had to prioritise core features (invoice automation, follow-up reminder and dashboards) over advanced functionalities.
- AI limitations:
Due to limited time, our predictive trend models and chatbot are still in early stages.

### Learnings
- Building a **modular, Docker-oriented architecture** gave us scalability.
- Effective team collaboration under time pressure is essential for rapid prototyping.

### Future improvements
- Fine-tune AI models for more accurate financial predictions.
- Enhance chatbot capabilities to handle more complex financial queries.
- Add a Purchase Order tab to link invoices directly to orders.
- Explore integration of cash outflow data.
- Conduct real-world testing with SMEs to refine workflows.

