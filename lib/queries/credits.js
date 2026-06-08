import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import * as creditsAPI from "@/lib/api/credits";

export function useCreditsBalance() {
  return useQuery({
    queryKey: ["credits", "balance"],
    queryFn: () => creditsAPI.getBalance(),
    select: (data) => data?.balance ?? 0,
    staleTime: 1000 * 60,
    retry: 1,
  });
}

export function useCreditsTransactions() {
  return useQuery({
    queryKey: ["credits", "transactions"],
    queryFn: () => creditsAPI.getTransactions(),
    staleTime: 1000 * 30,
  });
}

export function useCreditPackages() {
  return useQuery({
    queryKey: ["credits", "packages"],
    queryFn: () => creditsAPI.getPackages(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSpendCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, leadType }) => creditsAPI.spendCredit(leadId, leadType),
    onSuccess: (data) => {
      queryClient.setQueryData(["credits", "balance"], (old) =>
        data?.newBalance !== undefined ? { balance: data.newBalance } : old
      );
    },
  });
}

export function useInvalidateCredits() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["credits"] });
}
