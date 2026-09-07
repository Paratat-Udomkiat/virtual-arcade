"use client";
import { useState, useEffect } from "react";
import AuthenticatedHeader from "../../components/AuthenticatedHeader";
import Protected from "../../components/Protected";
import "../../styles/balance.css";

export default function BalancePage() {
  const [redeemAmount, setRedeemAmount] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [redeemAgree, setRedeemAgree] = useState(false);
  const [creditAgree, setCreditAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const creditUnit = "credits";

  // Show notification function
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Mouse tracking wave effect
  const handleMouseMove = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Update CSS custom properties for the wave position (เป็น percentage)
    button.style.setProperty('--mouse-x', `${x}%`);
    button.style.setProperty('--mouse-y', `${y}%`);
  };

  const handleMouseEnter = (event) => {
    const button = event.currentTarget;
    // เพิ่ม class สำหรับ active wave state
    button.classList.add('wave-active');
  };

  const handleMouseLeave = (event) => {
    const button = event.currentTarget;
    // Reset position to center when mouse leaves
    button.style.setProperty('--mouse-x', '50%');
    button.style.setProperty('--mouse-y', '50%');
    button.classList.remove('wave-active');
  };

  // Fetch balance when component mounts and when page becomes visible
  useEffect(() => {
    fetchBalance();
    
    // Refresh balance when user comes back to this page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Page became visible, refreshing balance...");
        fetchBalance();
      }
    };
    
    const handleFocus = () => {
      console.log("🔄 Window focused, refreshing balance...");
      fetchBalance();
    };
    
    // Listen for balance updates from other pages (e.g., Game1)
    const handleBalanceUpdate = (event) => {
      console.log("🔔 Received balance update notification:", event.detail);
      fetchBalance();
    };
    
    const handleStorageChange = (event) => {
      if (event.key === 'balance_updated') {
        console.log("🔔 LocalStorage balance update detected");
        fetchBalance();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    // Auto refresh balance every 3 seconds when page is visible
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        console.log("🔄 Auto-refreshing balance...");
        fetchBalance();
      }
    }, 3000);
    
    // Cleanup listeners and interval
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  // The effect intentionally owns the refresh lifecycle and its listeners.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBalance = async (showLoadingIndicator = false) => {
    try {
      if (showLoadingIndicator) {
        setBalanceLoading(true);
      }
      
      const response = await fetch("http://localhost:8000/balance", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const newBalance = data.amount.toFixed(2);
        
        // Show notification if balance changed significantly
        if (parseFloat(newBalance) !== parseFloat(balance) && !balanceLoading) {
          const diff = parseFloat(newBalance) - parseFloat(balance);
          if (Math.abs(diff) > 0.01) {
            const message = diff > 0 ? 
              `✨ Virtual balance increased by ${diff.toFixed(2)} ${creditUnit}` :
              `↘ Virtual balance decreased by ${Math.abs(diff).toFixed(2)} ${creditUnit}`;
            showNotification(message, diff > 0 ? 'success' : 'info');
          }
        }
        
        setBalance(newBalance);
        console.log(`✨ Virtual balance fetched: ${newBalance} ${creditUnit} (${data.last_updated})`);
      } else {
        console.error("Failed to fetch balance");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemAgree) {
      showNotification("Please agree to Terms of Service and Privacy Policy", 'error');
      return;
    }
    
    const amount = parseFloat(redeemAmount);
    if (amount <= 0) {
      showNotification("Please enter a valid amount", 'error');
      return;
    }

    if (amount > parseFloat(balance)) {
      showNotification("Insufficient balance", 'error');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ amount: amount }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(`Credits redeemed successfully! Virtual balance: ${data.new_balance.toFixed(2)} ${creditUnit}`, 'success');
        setBalance(data.new_balance.toFixed(2));
        setRedeemAmount("");
        setRedeemAgree(false);
      } else {
        showNotification(data.detail || "Token redemption failed", 'error');
      }
    } catch (error) {
      console.error("Token redemption error:", error);
      showNotification("Network error. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (e) => {
    e.preventDefault();
    if (!creditAgree) {
      showNotification("Please agree to Terms of Service and Privacy Policy", 'error');
      return;
    }
    
    const amount = parseFloat(creditAmount);
    if (amount <= 0) {
      showNotification("Please enter a valid amount", 'error');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ amount: amount }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(`Credits added successfully! Virtual balance: ${data.new_balance.toFixed(2)} ${creditUnit}`, 'success');
        setBalance(data.new_balance.toFixed(2));
        setCreditAmount("");
        setCreditAgree(false);
      } else {
        showNotification(data.detail || "Adding credits failed", 'error');
      }
    } catch (error) {
      console.error("Add credits error:", error);
      showNotification("Network error. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <div className="balance-page">
        {/* Header */}
        <AuthenticatedHeader />

        <div className="balance-container">
          {/* Combined Header and Balance */}
          <div>
            <div className="balance-header">
              <h1>VIRTUAL CREDIT CENTER</h1>
            </div>
            <div className="balance-display">
              <h2>Balance</h2>
              <div className="balance-amount">
                {balanceLoading ? "Loading..." : `${balance} ${creditUnit}`}
              </div>
              <div className="balance-status">Available</div>
            </div>
          </div>

        {/* Action Cards */}
        <div className="action-grid">
          {/* Redeem credits card */}
          <div className="action-card">
            <h3>Redeem Credits</h3>
            
            <div className="warning-banner">
              Please carefully check your transaction details
            </div>

            <form onSubmit={handleRedeem}>
              <div className="form-group">
                <label className="form-label">Enter Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="action-btn"
                disabled={loading || !redeemAmount || !redeemAgree}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="redeemAgree"
                  checked={redeemAgree}
                  onChange={(e) => setRedeemAgree(e.target.checked)}
                  required
                />
                <label htmlFor="redeemAgree">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </label>
              </div>
            </form>
          </div>

          {/* Add credits card */}
          <div className="action-card">
            <h3>Add Credits</h3>
            
            <div className="warning-banner">
              Please carefully check your transaction details
            </div>

            <form onSubmit={handleAddCredits}>
              <div className="form-group">
                <label className="form-label">Enter Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="action-btn"
                disabled={loading || !creditAmount || !creditAgree}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="creditAgree"
                  checked={creditAgree}
                  onChange={(e) => setCreditAgree(e.target.checked)}
                  required
                />
                <label htmlFor="creditAgree">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span>{notification.message}</span>
            <button 
              className="notification-close" 
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      </div>
    </Protected>
  );
}
