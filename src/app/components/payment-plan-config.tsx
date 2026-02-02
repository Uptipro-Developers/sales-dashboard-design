// ══════════════════════════════════════════════════════════════════════════
// API SERVICE - Complete Backend Integration
// All endpoints for Admin Dashboard
// ══════════════════════════════════════════════════════════════════════════;
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import axios from "axios";i/label";
import { Input } from "./ui/input";
const api = axios.create({ui/button";
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
});elect,
  SelectContent,
// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {elect";
    config.headers.Authorization = `Bearer ${token}`;yment";
  }ort { generateInstallments, formatNaira } from "../utils/payment-calculations";
  return config;
});erface PaymentPlanConfigProps {
  totalAmount: number;
// Handle token refresh on 401Plan) => void;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;Amount, onPlanChange, initialPlan }: PaymentPlanConfigProps) {
  const [planType, setPlanType] = useState<"full" | "installment">(initialPlan?.type || "full");
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;s || 3
  );
      try {equency, setFrequency] = useState<"monthly" | "quarterly" | "custom">(
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken },|| new Date().toISOString().split('T')[0]
          {
            headers: {ments, setCustomInstallments] = useState<Installment[]>(
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );ndlePlanTypeChange = (type: "full" | "installment") => {
    setPlanType(type);
        const { access_token } = response.data;
        localStorage.setItem("access_token", access_token);
      const plan: PaymentPlan = {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // localStorage.removeItem('access_token');
        // localStorage.removeItem('refresh_token');
        // Remove window.location.href, let your app handle navigation
        // Optionally, you can emit an event or set a flag here
        return Promise.reject(refreshError);
      }
    }
  const updateInstallmentPlan = () => {
    return Promise.reject(error);y === "custom" && customInstallments.length > 0
  }   ? customInstallments
);    : generateInstallments(totalAmount, numberOfInstallments, frequency, new Date(startDate));

// ══════════════════════════════════════════════════════════════════════════
// AUTH API "installment",
// ══════════════════════════════════════════════════════════════════════════
      currency: "NGN",
export const authApi = {ts,
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },};
    
  register: async (data: {
    email: string;!== "custom") {
    password: string;lments(installments);
    name: string;
    role: string;
  }) => {
    const response = await api.post("/auth/register", data);> {
    return response.data;value) || 3;
  },setNumberOfInstallments(num);
  };
  logout: async () => {
    await api.post("/auth/logout");lue: "monthly" | "quarterly" | "custom") => {
  },setFrequency(value);
  };
  getProfile: async () => {
    const response = await api.get("/auth/me");=> {
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {dueDate", value: string | number) => {
    const response = await api.post("/auth/change-password", {
      currentPassword,unt") {
      newPassword,x] = { ...updated[index], amount: Number(value) };
    });lse {
    return response.data;...updated[index], dueDate: value as string };
  },}
    setCustomInstallments(updated);
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;ent = () => {
  },const newInstallment: Installment = {
      id: `inst-custom-${Date.now()}`,
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post("/auth/reset-password", {
      token,e: new Date().toISOString().split('T')[0],
      newPassword,ding",
    });
    return response.data;([...customInstallments, newInstallment]);
  },
};
  const removeCustomInstallment = (index: number) => {
// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD APItallments(updated);
// ══════════════════════════════════════════════════════════════════════════

export const dashboardApi = {allments total matches
  getOverview: async () => {Installments.reduce((sum, inst) => sum + inst.amount, 0);
    const response = await api.get("/dashboard/overview");tal === totalAmount;
    return response.data;
  },turn (
    <Card>
  getRecentTransactions: async () => {
    const response = await api.get("/dashboard/recent-transactions");
    return response.data;ssName="w-5 h-5" />
  },      Payment Plan Configuration
};      </CardTitle>
      </CardHeader>
// ══════════════════════════════════════════════════════════════════════════
// COMPANIES API Type Selection */}
// ══════════════════════════════════════════════════════════════════════════
          <Label>Payment Type</Label>
export const companiesApi = {Type} onValueChange={handlePlanTypeChange}>
  getAll: async (filters?: any) => {
    const response = await api.get("/companies", { params: filters });
    return response.data;er>
  },        <SelectContent>
              <SelectItem value="full">Full Payment</SelectItem>
  getById: async (id: string) => {nstallment">Installment Plan</SelectItem>
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },    </div>

  create: async (data: any) => {(
    const response = await api.post("/companies", data);accent/20 rounded-lg">
    return response.data;e="flex items-center justify-between">
  },          <div>
                <p className="text-sm text-muted-foreground">Total Payment</p>
  update: async (id: string, data: any) => {semibold text-accent">{formatNaira(totalAmount)}</p>
    const response = await api.put(`/companies/${id}`, data);
    return response.data;ant="outline" className="bg-accent/10 text-accent border-accent/30">
  },            Single Payment
              </Badge>
  delete: async (id: string) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
        {planType === "installment" && (
  updateStats: async (id: string) => {
    const response = await api.post(`/companies/${id}/stats`);
    return response.data;e="grid grid-cols-2 gap-4">
  },          <div className="space-y-2">
};              <Label>Number of Installments</Label>
                <Input
// ══════════════════════════════════════════════════════════════════════════
// ASSETS API     min="2"
// ══════════════════════════════════════════════════════════════════════════
                  value={numberOfInstallments}
export const assetsApi = {={(e) => handleNumberOfInstallmentsChange(e.target.value)}
  getAll: async () => (await api.get("/assets")).data,allmentPlan}
};

// ══════════════════════════════════════════════════════════════════════════          <div className="space-y-2">
// TRANSACTIONS API                <Label>Frequency</Label>
// ══════════════════════════════════════════════════════════════════════════quency} onValueChange={handleFrequencyChange}>

export const transactionsApi = {ctValue />
  getAll: async (filters?: any) => {              </SelectTrigger>
    const response = await api.get("/transactions", { params: filters });                  <SelectContent>
    return response.data;value="monthly">Monthly</SelectItem>
  },rterly</SelectItem>
ctItem value="custom">Custom Schedule</SelectItem>
  getById: async (id: string) => {              </SelectContent>
    const response = await api.get(`/transactions/${id}`);                </Select>
    return response.data;
  },

  create: async (data: any) => {        {frequency !== "custom" && (
    const response = await api.post("/transactions", data);              <div className="space-y-2">
    return response.data;</Label>
  },
ate"
  update: async (id: string, data: any) => {              value={startDate}
    const response = await api.put(`/transactions/${id}`, data);                  onChange={(e) => handleStartDateChange(e.target.value)}
    return response.data;stallmentPlan}
  },

  recordPayment: async (id: string, paymentData: any) => {        )}
    const response = await api.post(`/transactions/${id}/payments`, paymentData);
    return response.data;
  },
dateInstallmentPlan}
  getCommission: async (id: string) => {          variant="outline"
    const response = await api.get(`/transactions/${id}/commission`);              className="w-full"
    return response.data;
  },
};

// ══════════════════════════════════════════════════════════════════════════        {/* Installment Preview */}
// COMMISSIONS API            {customInstallments.length > 0 && (
// ══════════════════════════════════════════════════════════════════════════

export const commissionsApi = {Installment Schedule</Label>
  getAll: async () => (await api.get("/commissions")).data,              {frequency === "custom" && (
  getSummary: async () => {                    <Button
    const response = await api.get("/commissions/summary");pe="button"
    return response.data;onClick={addCustomInstallment}
  },       variant="ghost"

  getUnpaid: async () => {            >
    const response = await api.get("/commissions/unpaid");
    return response.data; Installment
  },                </Button>
                  )}
  getPaid: async () => {
    const response = await api.get("/commissions/paid");
    return response.data;sName="space-y-2 max-h-64 overflow-y-auto">
  },              {customInstallments.map((installment, index) => (
                  <div
  markAsPaid: async (id: string) => {                      key={installment.id}
    const response = await api.post(`/commissions/${id}/mark-paid`);der"
    return response.data; >
  },>
                        <Badge variant="outline" className="text-xs">
  getByTransaction: async (transactionId: string) => {lment {installment.installmentNumber}
    const response = await api.get(`/commissions/transaction/${transactionId}`);
    return response.data;gth > 1 && (
  }, <Button
};                        type="button"
                            onClick={() => removeCustomInstallment(index)}
// ══════════════════════════════════════════════════════════════════════════t="ghost"
// INSTALLMENTS API
// ══════════════════════════════════════════════════════════════════════════   className="h-6 w-6 p-0"
                      >
export const installmentsApi = {                            <Trash2 className="w-3 h-3" />
  getAll: async () => {on>
    const response = await api.get("/installments");
    return response.data;iv>
  },                  
                      {frequency === "custom" ? (
  getByTransaction: async (transactionId: string) => { grid-cols-2 gap-2">
    const response = await api.get(`/installments/transaction/${transactionId}`);
    return response.data;   <Label className="text-xs">Amount</Label>
  },                        <Input
                              type="number"
  recordPayment: async (id: string, amount: number) => {
    const response = await api.post(`/installments/${id}/payment`, { amount });
    return response.data;       handleCustomInstallmentChange(index, "amount", e.target.value)
  },                          }
                              className="h-8"
  getUpcoming: async () => {
    const response = await api.get("/installments/upcoming");
    return response.data; <div>
  },                        <Label className="text-xs">Due Date</Label>
                          <Input
  getOverdue: async () => {                              type="date"
    const response = await api.get("/installments/overdue");
    return response.data;            onChange={(e) =>
  },", e.target.value)
};                              }
lassName="h-8"
// ══════════════════════════════════════════════════════════════════════════
// LEADS API/div>
// ══════════════════════════════════════════════════════════════════════════
 (
export const leadsApi = {                    <div className="flex items-center justify-between text-sm">
  getAll: async (filters?: any) => {                          <span className="text-muted-foreground">
    const response = await api.get("/leads", { params: filters });  <Calendar className="w-3 h-3 inline mr-1" />
    return response.data;
  }, </span>
                      <span className="font-semibold">
  getById: async (id: string) => {                            {formatNaira(installment.amount)}
    const response = await api.get(`/leads/${id}`);  </span>
    return response.data;
  },
                </div>
  create: async (data: any) => {                  ))}
    const response = await api.post("/leads", data);
    return response.data;
  }, Validation for Custom */}
            {frequency === "custom" && (
  update: async (id: string, data: any) => {                  <div className={`p-3 rounded-lg border ${
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },bg-destructive/5 border-destructive/20"
              }`}>
  delete: async (id: string) => {                  <div className="flex items-center justify-between text-sm">
    const response = await api.delete(`/leads/${id}`);                      <span className="text-muted-foreground">Total Installments</span>
    return response.data;
  },     isCustomValid ? "text-accent" : "text-destructive"

  assign: async (id: string, assigneeId: string) => {                        {formatNaira(customTotal)}
    const response = await api.put(`/leads/${id}/assign`, { assigneeId });
    return response.data;iv>
  },
className="text-xs text-destructive mt-1">
  updateStatus: async (id: string, status: string) => {                    Total must equal {formatNaira(totalAmount)}
    const response = await api.put(`/leads/${id}/status`, { status });                      </p>
    return response.data;
  },
};

// ══════════════════════════════════════════════════════════════════════════                {/* Summary */}
// AGENTS API
// ══════════════════════════════════════════════════════════════════════════nded-lg">
className="grid grid-cols-3 gap-4 text-center">
export const agentsApi = {                  <div>
  getAll: async () => (await api.get("/agents")).data,                        <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
  create: async (data: any) => (await api.post("/agents", data)).data,lassName="font-semibold">{formatNaira(totalAmount)}</p>
  update: async (id: string, data: any) => (await api.put(`/agents/${id}`, data)).data,
  remove: async (id: string) => (await api.delete(`/agents/${id}`)).data,v>
};                    <p className="text-xs text-muted-foreground mb-1">Installments</p>
                        <p className="font-semibold">{customInstallments.length}</p>
export const freelancersApi = {>
  getAll: async () => (await api.get("/freelancers")).data,
  create: async (data: any) => (await api.post("/freelancers", data)).data,p className="text-xs text-muted-foreground mb-1">Avg. Payment</p>
  remove: async (id: string) => (await api.delete(`/freelancers/${id}`)).data,                    <p className="font-semibold">
};                        {formatNaira(Math.round(totalAmount / customInstallments.length))}
                        </p>
export const clustersApi = {
  getAll: async () => (await api.get("/clusters")).data,        </div>
};
                )}
export const dealsApi = {
  getMyDeals: async () => (await api.get("/deals?assignedTo=currentUserId")).data,
  getTeamDeals: async () => (await api.get("/deals?teamLead=currentUserId")).data,
};
  </CardContent>
export const supportApi = {    </Card>
  getFaqs: async () => (await api.get("/support/faqs")).data,
};
export const userApi = {  getCurrent: async () => (await api.get("/users/me")).data,};