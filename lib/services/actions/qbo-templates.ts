export interface QBODepositPayload {
  TxnDate: string
  PrivateNote: string
  DocNumber: string
  DepositToAccountRef: {
    value: string
  }
  Line: Array<{
    DetailType: string
    Amount: number
    DepositLineDetail: {
      AccountRef: {
        value: string
      }
    }
  }>
}

export interface QBOPaymentPayload {
  TxnDate: string
  TotalAmt: number
  PrivateNote: string
  DocNumber: string
  CustomerRef: {
    value: string
  }
  PaymentMethodRef: {
    value: string
  }
  Line: Array<{
    DetailType: string
    Amount: number
    LinkedTxn: Array<{
      TxnId: string
      TxnType: string
    }>
  }>
}

export interface QBOTransferPayload {
  TxnDate: string
  Amount: number
  PrivateNote: string
  DocNumber: string
  FromAccountRef: {
    value: string
  }
  ToAccountRef: {
    value: string
  }
}

export interface QBOExpensePayload {
  TxnDate: string
  TotalAmt: number
  PrivateNote: string
  DocNumber: string
  AccountRef: {
    value: string
  }
  PaymentMethodRef: {
    value: string
  }
  Line: Array<{
    DetailType: string
    Amount: number
    AccountBasedExpenseLineDetail: {
      AccountRef: {
        value: string
      }
    }
  }>
}

export class QBOTemplates {
  // Build deposit payload for Stripe payout
  buildDepositPayload(
    payout: any,
    bank: any,
    accounts: {
      bankAccountId: string
      revenueAccountId: string
      feesAccountId: string
    }
  ): QBODepositPayload {
    const txnDate = bank.posted_date || payout.arrival_date
    const payoutId = payout.payout_id
    const netAmount = payout.amount_net / 100 // Convert from cents to dollars
    const feeAmount = payout.amount_fee / 100

    const payload: QBODepositPayload = {
      TxnDate: txnDate,
      PrivateNote: `Finacly • Stripe Payout ${payoutId}`,
      DocNumber: `stripe_payout:${payoutId}`,
      DepositToAccountRef: {
        value: accounts.bankAccountId
      },
      Line: [
        {
          DetailType: 'DepositLineDetail',
          Amount: netAmount,
          DepositLineDetail: {
            AccountRef: {
              value: accounts.revenueAccountId
            }
          }
        }
      ]
    }

    // Add fee line if there are fees
    if (feeAmount > 0) {
      payload.Line.push({
        DetailType: 'DepositLineDetail',
        Amount: -feeAmount, // Negative amount for fee
        DepositLineDetail: {
          AccountRef: {
            value: accounts.feesAccountId
          }
        }
      })
    }

    return payload
  }

  // Build payment payload for invoice payment
  buildPaymentPayload(
    invoice: any,
    bank: any,
    customerId: string
  ): QBOPaymentPayload {
    const txnDate = bank.posted_date
    const amount = bank.amount / 100 // Convert from cents to dollars
    const invoiceId = invoice.qbo_id

    return {
      TxnDate: txnDate,
      TotalAmt: amount,
      PrivateNote: `Finacly • Payment for Invoice ${invoiceId}`,
      DocNumber: `payment:${bank.id}`,
      CustomerRef: {
        value: customerId
      },
      PaymentMethodRef: {
        value: '1' // Cash/Check payment method
      },
      Line: [
        {
          DetailType: 'PaymentLineDetail',
          Amount: amount,
          LinkedTxn: [
            {
              TxnId: invoiceId,
              TxnType: 'Invoice'
            }
          ]
        }
      ]
    }
  }

  // Build transfer payload for internal transfers
  buildTransferPayload(
    fromBank: any,
    toBank: any,
    accounts: {
      fromAccountId: string
      toAccountId: string
    }
  ): QBOTransferPayload {
    const txnDate = fromBank.posted_date
    const amount = Math.abs(fromBank.amount) / 100 // Convert from cents to dollars

    return {
      TxnDate: txnDate,
      Amount: amount,
      PrivateNote: `Finacly • Internal Transfer from ${fromBank.description} to ${toBank.description}`,
      DocNumber: `transfer:${fromBank.id}_${toBank.id}`,
      FromAccountRef: {
        value: accounts.fromAccountId
      },
      ToAccountRef: {
        value: accounts.toAccountId
      }
    }
  }

  // Build expense payload for bank charges/fees
  buildExpensePayload(
    bank: any,
    category: {
      expenseAccountId: string
    }
  ): QBOExpensePayload {
    const txnDate = bank.posted_date
    const amount = Math.abs(bank.amount) / 100 // Convert from cents to dollars

    return {
      TxnDate: txnDate,
      TotalAmt: amount,
      PrivateNote: `Finacly • Bank Charge - ${bank.description}`,
      DocNumber: `expense:${bank.id}`,
      AccountRef: {
        value: category.expenseAccountId
      },
      PaymentMethodRef: {
        value: '1' // Cash/Check payment method
      },
      Line: [
        {
          DetailType: 'AccountBasedExpenseLineDetail',
          Amount: amount,
          AccountBasedExpenseLineDetail: {
            AccountRef: {
              value: category.expenseAccountId
            }
          }
        }
      ]
    }
  }

  // Build cash deposit payload (Mode A: Move from Undeposited Funds)
  buildCashDepositModeA(
    bank: any,
    accounts: {
      bankAccountId: string
      undepositedFundsAccountId: string
    }
  ): QBODepositPayload {
    const txnDate = bank.posted_date
    const amount = bank.amount / 100 // Convert from cents to dollars

    return {
      TxnDate: txnDate,
      PrivateNote: `Finacly • Cash Deposit - ${bank.description}`,
      DocNumber: `cash_deposit:${bank.id}`,
      DepositToAccountRef: {
        value: accounts.bankAccountId
      },
      Line: [
        {
          DetailType: 'DepositLineDetail',
          Amount: amount,
          DepositLineDetail: {
            AccountRef: {
              value: accounts.undepositedFundsAccountId
            }
          }
        }
      ]
    }
  }

  // Build cash deposit payload (Mode B: Credit Cash Sales)
  buildCashDepositModeB(
    bank: any,
    accounts: {
      bankAccountId: string
      cashSalesAccountId: string
    }
  ): QBODepositPayload {
    const txnDate = bank.posted_date
    const amount = bank.amount / 100 // Convert from cents to dollars

    return {
      TxnDate: txnDate,
      PrivateNote: `Finacly • Cash Sales - ${bank.description}`,
      DocNumber: `cash_sales:${bank.id}`,
      DepositToAccountRef: {
        value: accounts.bankAccountId
      },
      Line: [
        {
          DetailType: 'DepositLineDetail',
          Amount: amount,
          DepositLineDetail: {
            AccountRef: {
              value: accounts.cashSalesAccountId
            }
          }
        }
      ]
    }
  }

  // Build e-Transfer expense payload
  buildETransferExpense(
    bank: any,
    accounts: {
      expenseAccountId: string
    }
  ): QBOExpensePayload {
    const txnDate = bank.posted_date
    const amount = Math.abs(bank.amount) / 100 // Convert from cents to dollars

    return {
      TxnDate: txnDate,
      TotalAmt: amount,
      PrivateNote: `Finacly • e-Transfer - ${bank.description}`,
      DocNumber: `etransfer:${bank.id}`,
      AccountRef: {
        value: accounts.expenseAccountId
      },
      PaymentMethodRef: {
        value: '1' // Cash/Check payment method
      },
      Line: [
        {
          DetailType: 'AccountBasedExpenseLineDetail',
          Amount: amount,
          AccountBasedExpenseLineDetail: {
            AccountRef: {
              value: accounts.expenseAccountId
            }
          }
        }
      ]
    }
  }

  // Validate payload before sending to QBO
  validatePayload(payload: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required fields
    if (!payload.TxnDate) {
      errors.push('TxnDate is required')
    }

    if (!payload.PrivateNote) {
      errors.push('PrivateNote is required')
    }

    if (!payload.DocNumber) {
      errors.push('DocNumber is required')
    }

    // Validate date format
    if (payload.TxnDate && !this.isValidDate(payload.TxnDate)) {
      errors.push('TxnDate must be in YYYY-MM-DD format')
    }

    // Validate amounts
    if (payload.Amount !== undefined && (isNaN(payload.Amount) || payload.Amount <= 0)) {
      errors.push('Amount must be a positive number')
    }

    if (payload.TotalAmt !== undefined && (isNaN(payload.TotalAmt) || payload.TotalAmt <= 0)) {
      errors.push('TotalAmt must be a positive number')
    }

    // Validate line items
    if (payload.Line && Array.isArray(payload.Line)) {
      for (let i = 0; i < payload.Line.length; i++) {
        const line = payload.Line[i]
        if (!line.Amount || isNaN(line.Amount)) {
          errors.push(`Line ${i + 1}: Amount is required and must be a number`)
        }
        if (!line.DetailType) {
          errors.push(`Line ${i + 1}: DetailType is required`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Check if date is valid
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
  }

  // Get template statistics
  getTemplateStats(): {
    supportedTypes: string[]
    requiredFields: { [key: string]: string[] }
    optionalFields: { [key: string]: string[] }
  } {
    return {
      supportedTypes: [
        'Deposit',
        'Payment', 
        'Transfer',
        'Expense',
        'CashDepositModeA',
        'CashDepositModeB',
        'ETransferExpense'
      ],
      requiredFields: {
        Deposit: ['TxnDate', 'PrivateNote', 'DocNumber', 'DepositToAccountRef', 'Line'],
        Payment: ['TxnDate', 'TotalAmt', 'PrivateNote', 'DocNumber', 'CustomerRef', 'Line'],
        Transfer: ['TxnDate', 'Amount', 'PrivateNote', 'DocNumber', 'FromAccountRef', 'ToAccountRef'],
        Expense: ['TxnDate', 'TotalAmt', 'PrivateNote', 'DocNumber', 'AccountRef', 'Line']
      },
      optionalFields: {
        Deposit: ['PaymentMethodRef'],
        Payment: ['PaymentMethodRef'],
        Transfer: [],
        Expense: ['PaymentMethodRef']
      }
    }
  }
}
