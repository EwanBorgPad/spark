import { SimpleModal } from "../SimpleModal"
import { twMerge } from "tailwind-merge"
import { Button } from "@/components/Button/Button"
import { useTranslation } from "react-i18next"
import { backendApi } from "@/data/backendApi"
import { useWalletContext } from "@/hooks/useWalletContext"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { EmailInputField } from "@/components/InputField/EmailInputField"
import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { Badge } from "@/components/Badge/Badge"
import { toast } from "react-toastify"
import { eligibilityStatusCacheBust } from "@/utils/cache-helper"
import { Transaction, SystemProgram, PublicKey, Connection, TransactionInstruction } from "@solana/web3.js"

// Use a public RPC endpoint
const RPC_ENDPOINT = "https://solana-mainnet.g.alchemy.com/v2/demo"

type ProvideEmailModalProps = {
  onClose: () => void
}

const ProvideEmailModal = ({ onClose }: ProvideEmailModalProps) => {
  const { t } = useTranslation()
  const { address, signMessage, signTransaction, walletProvider, isConnectedWithLedger } = useWalletContext()
  const { projectId } = useParams()
  const queryClient = useQueryClient()


  const {
    mutate: updateEmail,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async (address: string) => {
      if (!address || !email || !projectId) return
      const message = t("email.provide.message", { email })

      let signature: Uint8Array
      let isLedgerTransaction = false

      if (isConnectedWithLedger) {
        // For Ledger users, create and sign an on-chain transaction
        const connection = new Connection(RPC_ENDPOINT)
        const recentBlockhash = await connection.getLatestBlockhash()
        
        // Create a transaction that includes the message as a memo
        const transaction = new Transaction()
        
        // Add a transfer instruction (zero amount) to make the transaction valid
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(address),
            toPubkey: new PublicKey(address),
            lamports: 0,
          })
        )
        
        // Add the message as a memo instruction
        // This ensures the message is included in the transaction
        transaction.add(
          new TransactionInstruction({
            keys: [],
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            data: Buffer.from(message),
          })
        )
        
        transaction.recentBlockhash = recentBlockhash.blockhash
        transaction.feePayer = new PublicKey(address)
        
        // Use the current wallet provider (Phantom, Backpack, or Solflare) with Ledger
        if (!walletProvider) throw new Error("No wallet provider selected")
        const signedTx = await signTransaction(transaction, walletProvider)
        if (!signedTx) throw new Error("Failed to sign transaction")
        
        signature = signedTx.signatures[0].signature!
        isLedgerTransaction = true
      } else {
        signature = await signMessage(message)
      }

      const data = {
        email,
        publicKey: address,
        // TODO no nonce or expiration, possibly a security concern
        message,
        signature: Array.from(signature),
        isLedgerTransaction,
      }

      await backendApi.postCreateEmail(data)
    },
    onSuccess: () => {
      eligibilityStatusCacheBust.invokeCacheBusting()
      queryClient.invalidateQueries({
        queryKey: ["getEligibilityStatus", address, projectId],
      })
      onClose()
    },
    onError: (error) => toast.error(error.message, { theme: "colored" }),
  })

  const [email, setEmail] = useState<string | null>(null)


  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <SimpleModal showCloseBtn={true} onClose={onClose} title={t("email.provide.heading")}>
      <div className="flex w-full max-w-[460px] flex-col items-center justify-center max-sm:h-full">
        <div className={twMerge("flex w-full grow flex-col justify-start gap-4 px-4 pb-8 pt-3 md:px-10")}>
          <p className="text-left text-base text-fg-tertiary md:text-center">
            {t("email.provide.description")}
          </p>

          <EmailInputField
            value={email ?? ""}
            onChange={(value) => {
              if (typeof value === 'string' || value === null) {
                setEmail(value);
              } else if (value.target) {
                setEmail(value.target.value);
              }
            }}
            placeholder={t("email.register.placeholder")}
            error={email && !isValidEmail(email) ? t("email.invalid") : undefined}
            containerClassName="max-w-full"
          />

          {isSuccess ? (
            <div className="flex w-full justify-center">
              <Badge.Confirmation isConfirmed={true} label={t("done")} classNames="w-fit bg-transparent border-none" />
            </div>
          ) : (
            <Button
              disabled={!email || isPending || !isValidEmail(email)}
              isLoading={isPending}
              btnText={t("email.provide.button")}
              onClick={() => updateEmail(address)}
            />
          )}
        </div>
      </div>
    </SimpleModal>
  )
}

export default ProvideEmailModal 