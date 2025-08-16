import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiArrowUp, FiArrowDown, FiRefreshCw, FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiBarChart2 } from 'react-icons/fi';


interface Stock {
    id: number;
    particulars: string;
    purchasePrice: number;
    quantity: number;
    investment: number;
    portfolioPercent: number;
    nseBse: string;
    cmp: number;
    presentValue: number;
    gainLoss: number;
    gainLossPercent: number;
    peRatio: number | null;
    latestEarnings: number | null;
    sector: string;
}

interface SectorSummary {
    sector: string;
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
    gainLossPercent: number;
}

interface PortfolioData {
    stocks: Stock[];
    sectors: SectorSummary[];
    summary: {
        totalInvestment: number;
        totalPresentValue: number;
        totalGainLoss: number;
        gainLossPercent: number;
    };
}

export default function PortfolioDashboard() {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/portfolio');
            setData(response.data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            setError('Failed to load portfolio data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 15000);
        return () => clearInterval(intervalId);
    }, []);

    const columns = [
        {
            Header: 'Particulars',
            accessor: 'particulars',
        },
        {
            Header: 'Purchase Price',
            accessor: 'purchasePrice',
            Cell: ({ value }: { value: number }) => `₹${value.toFixed(2)}`,
        },
        {
            Header: 'Qty',
            accessor: 'quantity',
        },
        {
            Header: 'Investment',
            accessor: 'investment',
            Cell: ({ value }: { value: number }) => `₹${value.toFixed(2)}`,
        },
        {
            Header: 'Portfolio %',
            accessor: 'portfolioPercent',
            Cell: ({ value }: { value: number }) => `${value.toFixed(2)}%`,
        },
        {
            Header: 'NSE/BSE',
            accessor: 'nseBse',
        },
        {
            Header: 'CMP',
            accessor: 'cmp',
            Cell: ({ value }: { value: number }) => `₹${value.toFixed(2)}`,
        },
        {
            Header: 'Present Value',
            accessor: 'presentValue',
            Cell: ({ value }: { value: number }) => `₹${value.toFixed(2)}`,
        },
        {
            Header: 'Gain/Loss',
            accessor: 'gainLoss',
            Cell: ({ value }: { value: number }) => (
                <span className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Math.abs(value).toFixed(2)} {value >= 0 ? <FiArrowUp className="inline" /> : <FiArrowDown className="inline" />}
                </span>
            ),
        },
        {
            Header: 'Gain/Loss %',
            accessor: 'gainLossPercent',
            Cell: ({ value }: { value: number }) => (
                <span className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {value.toFixed(2)}%
                </span>
            ),
        },
        {
            Header: 'P/E Ratio',
            accessor: 'peRatio',
            Cell: ({ value }: { value: number | null }) => value ? value.toFixed(2) : 'N/A',
        },
        {
            Header: 'Latest Earnings',
            accessor: 'latestEarnings',
            Cell: ({ value }: { value: number | null }) => value ? `₹${value.toFixed(2)}` : 'N/A',
        },
    ];

    if (loading && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <button
                        onClick={fetchData}
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const totalInvestment = data.summary.totalInvestment;
    const stocksWithPercent = data.stocks.map(stock => ({
        ...stock,
        portfolioPercent: totalInvestment ? (stock.investment / totalInvestment) * 100 : 0
    }));

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <FiBarChart2 className="text-blue-600" /> Portfolio Dashboard
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </header>

                {/* Portfolio Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                                <FiDollarSign size={20} />
                            </div>
                            <h3 className="text-gray-500 font-medium">Total Investment</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                            ₹{data?.summary.totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-green-50 text-green-600">
                                <FiTrendingUp size={20} />
                            </div>
                            <h3 className="text-gray-500 font-medium">Current Value</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                            ₹{data?.summary.totalPresentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-full ${data?.summary.totalGainLoss >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {data?.summary.totalGainLoss >= 0 ? <FiTrendingUp size={20} /> : <FiTrendingDown size={20} />}
                            </div>
                            <h3 className="text-gray-500 font-medium">Overall Gain/Loss</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-2xl font-bold ${data?.summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{Math.abs(data?.summary.totalGainLoss || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <span className={`text-sm ${data?.summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({data?.summary.gainLossPercent.toFixed(2)}%)
                                {data?.summary.totalGainLoss >= 0 ? (
                                    <FiArrowUp className="inline ml-1" />
                                ) : (
                                    <FiArrowDown className="inline ml-1" />
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sector Performance */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                            <FiPieChart size={20} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">Sector Performance</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss %</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data?.sectors.map((sector) => (
                                    <tr key={sector.sector} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sector.sector}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">₹{sector.totalInvestment.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">₹{sector.totalPresentValue.toLocaleString('en-IN')}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${sector.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ₹{Math.abs(sector.totalGainLoss).toLocaleString('en-IN')}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${sector.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {sector.gainLossPercent.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Portfolio Holdings */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                            <FiBarChart2 size={20} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">Portfolio Holdings</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map((column) => (
                                        <th
                                            key={column.Header}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {column.Header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stocksWithPercent.map((stock) => (
                                    <tr key={stock.id} className="hover:bg-gray-50">
                                        {columns.map((column) => {
                                            const cellValue = stock[column.accessor as keyof Stock];
                                            return (
                                                <td key={column.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                    {column.Cell ? column.Cell({ value: cellValue }) : cellValue}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

}