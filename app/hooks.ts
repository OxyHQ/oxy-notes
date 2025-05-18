
import {
    useCallback,
    useContext,
    useDebugValue,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState
} from 'react';

// Export hooks from React
export {
    useCallback, useContext, useDebugValue, useEffect, useImperativeHandle,
    useLayoutEffect, useMemo, useReducer, useRef, useState
};

// Default export (required by expo-router)
export default { 
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  useDebugValue
};
